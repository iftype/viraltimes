import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { QuizCardConfig, QuizLog, QuizLogDocument } from "./quiz-types.js";

export class QuizStore {
  private writeQueue = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async addLog(log: QuizLog): Promise<void> {
    await this.serialWrite(async () => {
      const document = await this.read();
      document.logs.push(log);
      await this.write(document);
    });
  }

  async getLogs(): Promise<QuizLog[]> {
    const document = await this.read();
    return document.logs;
  }

  async deleteSession(sessionId: string): Promise<number> {
    let deleted = 0;
    await this.serialWrite(async () => {
      const document = await this.read();
      const before = document.logs.length;
      document.logs = document.logs.filter((log) => log.sessionId !== sessionId);
      deleted = before - document.logs.length;
      if (deleted) await this.write(document);
    });
    return deleted;
  }

  async clearLogs(): Promise<number> {
    let deleted = 0;
    await this.serialWrite(async () => {
      const document = await this.read();
      deleted = document.logs.length;
      document.logs = [];
      if (deleted) await this.write(document);
    });
    return deleted;
  }

  async getCards(): Promise<QuizCardConfig[]> {
    const document = await this.read();
    return (document.cards ?? []).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async replaceCards(cards: QuizCardConfig[]): Promise<QuizCardConfig[]> {
    await this.serialWrite(async () => {
      const document = await this.read();
      document.cards = cards;
      await this.write(document);
    });
    return cards;
  }

  private async serialWrite(operation: () => Promise<void>) {
    this.writeQueue = this.writeQueue.then(operation, operation);
    await this.writeQueue;
  }

  private async read(): Promise<QuizLogDocument> {
    try {
      const parsed = JSON.parse(await readFile(this.filePath, "utf8")) as QuizLogDocument;
      return Array.isArray(parsed.logs) ? parsed : { logs: [] };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { logs: [] };
      throw error;
    }
  }

  private async write(document: QuizLogDocument) {
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(document, null, 2)}\n`, { mode: 0o600 });
    await rename(temporaryPath, this.filePath);
  }
}
