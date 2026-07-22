import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

import type { QuizCardConfig, QuizLog, QuizLogDocument } from "./quiz-types.js";

const legacyMigrationName = "quiz-json-v1";

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
    const result = this.database.prepare("DELETE FROM quiz_logs WHERE session_id = ?").run(sessionId);
    return Number(result.changes);
  }

  async clearLogs(): Promise<number> {
    const result = this.database.prepare("DELETE FROM quiz_logs").run();
    return Number(result.changes);
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
    `);
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
