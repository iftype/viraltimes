import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { QuizLog, QuizLogDocument } from "./quiz-types.js";

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
