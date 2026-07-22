import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

import type {
  QuizCardConfig,
  QuizLog,
  QuizLogDocument,
  QuizSurveyAnswer,
  QuizSurveyQuestion,
  QuizSurveySubmission,
} from "./quiz-types.js";

const legacyMigrationName = "quiz-json-v1";
const multipleSurveyMigrationName = "quiz-survey-multiple-v1";

type QuizLogRow = {
  id: string;
  session_id: string;
  card_id: string;
  card_type: QuizLog["cardType"];
  response: QuizLog["response"];
  run_id: string | null;
  step: number | null;
  destination: string | null;
  timestamp: string;
};

type QuizCardRow = {
  id: string;
  meme_id: string;
  field: string;
  enabled: number;
  sort_order: number;
  updated_at: string;
};

type QuizSurveyQuestionRow = {
  id: string;
  prompt: string;
  required: number;
  sort_order: number;
  updated_at: string;
};

type QuizSurveyOptionRow = { id: string; question_id: string; label: string; sort_order: number };

type QuizSurveyAnswerRow = {
  id: string;
  session_id: string;
  run_id: string;
  question_id: string;
  option_id: string;
  question_prompt: string;
  option_label: string;
  timestamp: string;
};

type QuizSurveySubmissionRow = {
  session_id: string;
  run_id: string;
  question_id: string;
  question_prompt: string;
  timestamp: string;
};

export class QuizStore {
  private readonly database: DatabaseSync;

  constructor(
    databasePath: string,
    legacyJsonPath?: string,
  ) {
    mkdirSync(dirname(databasePath), { recursive: true });
    this.database = new DatabaseSync(databasePath);
    this.database.exec("PRAGMA journal_mode = WAL");
    this.database.exec("PRAGMA synchronous = NORMAL");
    this.database.exec("PRAGMA foreign_keys = ON");
    this.database.exec("PRAGMA busy_timeout = 5000");
    this.createSchema();
    this.migrateSurveyAnswersToMultiple();
    if (legacyJsonPath) this.importLegacyJsonOnce(legacyJsonPath);
  }

  async addLog(log: QuizLog): Promise<void> {
    this.insertLog(log);
  }

  async getLogs(): Promise<QuizLog[]> {
    const rows = this.database.prepare(`
      SELECT id, session_id, card_id, card_type, response, run_id, step, destination, timestamp
      FROM quiz_logs
      ORDER BY timestamp ASC, id ASC
    `).all() as unknown as QuizLogRow[];
    return rows.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      cardId: row.card_id,
      cardType: row.card_type,
      response: row.response,
      runId: row.run_id ?? undefined,
      step: row.step ?? undefined,
      destination: row.destination ?? undefined,
      timestamp: row.timestamp,
    }));
  }

  async deleteSession(sessionId: string): Promise<number> {
    let deleted = 0;
    this.inTransaction(() => {
      deleted += Number(this.database.prepare("DELETE FROM quiz_logs WHERE session_id = ?").run(sessionId).changes);
      deleted += Number(this.database.prepare("DELETE FROM quiz_survey_answers WHERE session_id = ?").run(sessionId).changes);
      deleted += Number(this.database.prepare("DELETE FROM quiz_survey_submissions WHERE session_id = ?").run(sessionId).changes);
    });
    return deleted;
  }

  async clearLogs(): Promise<number> {
    let deleted = 0;
    this.inTransaction(() => {
      deleted += Number(this.database.prepare("DELETE FROM quiz_logs").run().changes);
      deleted += Number(this.database.prepare("DELETE FROM quiz_survey_answers").run().changes);
      deleted += Number(this.database.prepare("DELETE FROM quiz_survey_submissions").run().changes);
    });
    return deleted;
  }

  async getCards(): Promise<QuizCardConfig[]> {
    const rows = this.database.prepare(`
      SELECT id, meme_id, field, enabled, sort_order, updated_at
      FROM quiz_cards
      ORDER BY sort_order ASC, id ASC
    `).all() as unknown as QuizCardRow[];
    return rows.map((row) => ({
      id: row.id,
      memeId: row.meme_id,
      field: row.field,
      enabled: Boolean(row.enabled),
      sortOrder: row.sort_order,
      updatedAt: row.updated_at,
    }));
  }

  async replaceCards(cards: QuizCardConfig[]): Promise<QuizCardConfig[]> {
    this.inTransaction(() => {
      this.database.exec("DELETE FROM quiz_cards");
      for (const card of cards) this.insertCard(card);
    });
    return cards;
  }

  async getSurveyQuestions(): Promise<QuizSurveyQuestion[]> {
    const questions = this.database.prepare(`
      SELECT id, prompt, required, sort_order, updated_at
      FROM quiz_survey_questions
      ORDER BY sort_order ASC, id ASC
    `).all() as unknown as QuizSurveyQuestionRow[];
    const options = this.database.prepare(`
      SELECT id, question_id, label, sort_order
      FROM quiz_survey_options
      ORDER BY sort_order ASC, id ASC
    `).all() as unknown as QuizSurveyOptionRow[];
    return questions.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      required: Boolean(question.required),
      sortOrder: question.sort_order,
      updatedAt: question.updated_at,
      options: options
        .filter((option) => option.question_id === question.id)
        .map((option) => ({ id: option.id, label: option.label })),
    }));
  }

  async replaceSurveyQuestions(questions: QuizSurveyQuestion[]): Promise<QuizSurveyQuestion[]> {
    this.inTransaction(() => {
      this.database.exec("DELETE FROM quiz_survey_questions");
      for (const question of questions) {
        this.database.prepare(`
          INSERT INTO quiz_survey_questions (id, prompt, required, sort_order, updated_at)
          VALUES (?, ?, ?, ?, ?)
        `).run(question.id, question.prompt, question.required ? 1 : 0, question.sortOrder, question.updatedAt);
        question.options.forEach((option, optionIndex) => {
          this.database.prepare(`
            INSERT INTO quiz_survey_options (id, question_id, label, sort_order)
            VALUES (?, ?, ?, ?)
          `).run(option.id, question.id, option.label, optionIndex);
        });
      }
    });
    return questions;
  }

  async addSurveyAnswer(answer: QuizSurveyAnswer): Promise<void> {
    this.database.prepare(`
      INSERT INTO quiz_survey_answers (
        id, session_id, run_id, question_id, option_id, question_prompt, option_label, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(run_id, question_id, option_id) DO UPDATE SET
        question_prompt = excluded.question_prompt,
        option_label = excluded.option_label,
        timestamp = excluded.timestamp
    `).run(
      answer.id,
      answer.sessionId,
      answer.runId,
      answer.questionId,
      answer.optionId,
      answer.questionPrompt,
      answer.optionLabel,
      answer.timestamp,
    );
  }

  async submitSurveyAnswers(
    submission: QuizSurveySubmission,
    answers: QuizSurveyAnswer[],
  ): Promise<void> {
    this.inTransaction(() => {
      this.database.prepare(`
        INSERT INTO quiz_survey_submissions (
          session_id, run_id, question_id, question_prompt, timestamp
        ) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(run_id, question_id) DO UPDATE SET
          session_id = excluded.session_id,
          question_prompt = excluded.question_prompt,
          timestamp = excluded.timestamp
      `).run(
        submission.sessionId,
        submission.runId,
        submission.questionId,
        submission.questionPrompt,
        submission.timestamp,
      );
      this.database.prepare(
        "DELETE FROM quiz_survey_answers WHERE run_id = ? AND question_id = ?",
      ).run(submission.runId, submission.questionId);
      for (const answer of answers) {
        this.database.prepare(`
          INSERT INTO quiz_survey_answers (
            id, session_id, run_id, question_id, option_id, question_prompt, option_label, timestamp
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          answer.id,
          answer.sessionId,
          answer.runId,
          answer.questionId,
          answer.optionId,
          answer.questionPrompt,
          answer.optionLabel,
          answer.timestamp,
        );
      }
    });
  }

  async getSurveyAnswers(): Promise<QuizSurveyAnswer[]> {
    const rows = this.database.prepare(`
      SELECT id, session_id, run_id, question_id, option_id, question_prompt, option_label, timestamp
      FROM quiz_survey_answers
      ORDER BY timestamp ASC, id ASC
    `).all() as unknown as QuizSurveyAnswerRow[];
    return rows.map((row) => ({
      id: row.id,
      sessionId: row.session_id,
      runId: row.run_id,
      questionId: row.question_id,
      optionId: row.option_id,
      questionPrompt: row.question_prompt,
      optionLabel: row.option_label,
      timestamp: row.timestamp,
    }));
  }

  async getSurveySubmissions(): Promise<QuizSurveySubmission[]> {
    const rows = this.database.prepare(`
      SELECT session_id, run_id, question_id, question_prompt, timestamp
      FROM quiz_survey_submissions
      ORDER BY timestamp ASC, run_id ASC
    `).all() as unknown as QuizSurveySubmissionRow[];
    return rows.map((row) => ({
      sessionId: row.session_id,
      runId: row.run_id,
      questionId: row.question_id,
      questionPrompt: row.question_prompt,
      timestamp: row.timestamp,
    }));
  }

  close() {
    this.database.close();
  }

  private createSchema() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name TEXT PRIMARY KEY,
        applied_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS quiz_cards (
        id TEXT PRIMARY KEY,
        meme_id TEXT NOT NULL UNIQUE,
        field TEXT NOT NULL,
        enabled INTEGER NOT NULL CHECK (enabled IN (0, 1)),
        sort_order INTEGER NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS quiz_logs (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        card_id TEXT NOT NULL,
        card_type TEXT NOT NULL CHECK (card_type IN ('minor', 'origin')),
        response TEXT NOT NULL CHECK (response IN (
          'start', 'know', 'dont_know', 'view_detail', 'view_media',
          'helpful', 'not_helpful', 'complete', 'open_meme', 'open_service'
        )),
        run_id TEXT,
        step INTEGER CHECK (step IS NULL OR step BETWEEN 0 AND 5),
        destination TEXT,
        timestamp TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS quiz_logs_session_idx
        ON quiz_logs (session_id, timestamp);
      CREATE INDEX IF NOT EXISTS quiz_logs_run_idx
        ON quiz_logs (run_id, timestamp) WHERE run_id IS NOT NULL;
      CREATE INDEX IF NOT EXISTS quiz_logs_card_idx
        ON quiz_logs (card_id, timestamp);

      CREATE TABLE IF NOT EXISTS quiz_survey_questions (
        id TEXT PRIMARY KEY,
        prompt TEXT NOT NULL,
        required INTEGER NOT NULL CHECK (required IN (0, 1)),
        sort_order INTEGER NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS quiz_survey_options (
        id TEXT PRIMARY KEY,
        question_id TEXT NOT NULL REFERENCES quiz_survey_questions(id) ON DELETE CASCADE,
        label TEXT NOT NULL,
        sort_order INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS quiz_survey_options_question_idx
        ON quiz_survey_options (question_id, sort_order);

      CREATE TABLE IF NOT EXISTS quiz_survey_answers (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        run_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        option_id TEXT NOT NULL,
        question_prompt TEXT NOT NULL,
        option_label TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        UNIQUE (run_id, question_id, option_id)
      );

      CREATE INDEX IF NOT EXISTS quiz_survey_answers_session_idx
        ON quiz_survey_answers (session_id, timestamp);
      CREATE INDEX IF NOT EXISTS quiz_survey_answers_question_idx
        ON quiz_survey_answers (question_id, option_id);

      CREATE TABLE IF NOT EXISTS quiz_survey_submissions (
        session_id TEXT NOT NULL,
        run_id TEXT NOT NULL,
        question_id TEXT NOT NULL,
        question_prompt TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        UNIQUE (run_id, question_id)
      );

      CREATE INDEX IF NOT EXISTS quiz_survey_submissions_session_idx
        ON quiz_survey_submissions (session_id, timestamp);
      CREATE INDEX IF NOT EXISTS quiz_survey_submissions_question_idx
        ON quiz_survey_submissions (question_id, timestamp);
    `);
  }

  private migrateSurveyAnswersToMultiple() {
    const migrated = this.database
      .prepare("SELECT 1 AS found FROM schema_migrations WHERE name = ?")
      .get(multipleSurveyMigrationName);
    if (migrated) return;

    const table = this.database
      .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'quiz_survey_answers'")
      .get() as { sql?: string } | undefined;
    const supportsMultiple = table?.sql
      ?.replaceAll(/\s+/g, " ")
      .includes("UNIQUE (run_id, question_id, option_id)");

    this.inTransaction(() => {
      if (!supportsMultiple) {
        this.database.exec(`
          CREATE TABLE quiz_survey_answers_multiple (
            id TEXT PRIMARY KEY,
            session_id TEXT NOT NULL,
            run_id TEXT NOT NULL,
            question_id TEXT NOT NULL,
            option_id TEXT NOT NULL,
            question_prompt TEXT NOT NULL,
            option_label TEXT NOT NULL,
            timestamp TEXT NOT NULL,
            UNIQUE (run_id, question_id, option_id)
          );
          INSERT OR IGNORE INTO quiz_survey_answers_multiple (
            id, session_id, run_id, question_id, option_id, question_prompt, option_label, timestamp
          ) SELECT
            id, session_id, run_id, question_id, option_id, question_prompt, option_label, timestamp
          FROM quiz_survey_answers;
          DROP TABLE quiz_survey_answers;
          ALTER TABLE quiz_survey_answers_multiple RENAME TO quiz_survey_answers;
          CREATE INDEX quiz_survey_answers_session_idx
            ON quiz_survey_answers (session_id, timestamp);
          CREATE INDEX quiz_survey_answers_question_idx
            ON quiz_survey_answers (question_id, option_id);
        `);
      }
      this.database
        .prepare("INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)")
        .run(multipleSurveyMigrationName, new Date().toISOString());
    });
  }

  private importLegacyJsonOnce(filePath: string) {
    const migrated = this.database
      .prepare("SELECT 1 AS found FROM schema_migrations WHERE name = ?")
      .get(legacyMigrationName);
    if (migrated || !existsSync(filePath)) return;

    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as QuizLogDocument;
    const logs = Array.isArray(parsed.logs) ? parsed.logs : [];
    const cards = Array.isArray(parsed.cards) ? parsed.cards : [];

    this.inTransaction(() => {
      for (const card of cards) this.insertCard(card, true);
      for (const log of logs) this.insertLog(log, true);
      this.database
        .prepare("INSERT INTO schema_migrations (name, applied_at) VALUES (?, ?)")
        .run(legacyMigrationName, new Date().toISOString());
    });
  }

  private insertLog(log: QuizLog, ignoreConflict = false) {
    this.database.prepare(`
      INSERT ${ignoreConflict ? "OR IGNORE" : ""} INTO quiz_logs (
        id, session_id, card_id, card_type, response, run_id, step, destination, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      log.id,
      log.sessionId,
      log.cardId,
      log.cardType,
      log.response,
      log.runId ?? null,
      log.step ?? null,
      log.destination ?? null,
      log.timestamp,
    );
  }

  private insertCard(card: QuizCardConfig, ignoreConflict = false) {
    this.database.prepare(`
      INSERT ${ignoreConflict ? "OR IGNORE" : ""} INTO quiz_cards (
        id, meme_id, field, enabled, sort_order, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      card.id,
      card.memeId,
      card.field,
      card.enabled ? 1 : 0,
      card.sortOrder,
      card.updatedAt,
    );
  }

  private inTransaction(operation: () => void) {
    this.database.exec("BEGIN IMMEDIATE");
    try {
      operation();
      this.database.exec("COMMIT");
    } catch (error) {
      this.database.exec("ROLLBACK");
      throw error;
    }
  }
}
