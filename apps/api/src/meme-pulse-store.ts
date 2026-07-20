import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { MemePulseDocument, MemePulseVote } from "./meme-pulse-types.js";

export class MemePulseStore {
  private writeQueue = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async upsert(vote: MemePulseVote) {
    await this.serialWrite(async () => {
      const document = await this.read();
      const index = document.items.findIndex((item) => item.memeId === vote.memeId && item.sessionId === vote.sessionId && item.observedOn === vote.observedOn);
      if (index >= 0) document.items[index] = vote;
      else document.items.push(vote);
      await this.write(document);
    });
  }

  async summary(memeId: string, days = 14) {
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - days + 1);
    const from = start.toISOString().slice(0, 10);
    const byDate = new Map<string, { date: string; seen: number; notSeen: number }>();
    for (const item of (await this.read()).items) {
      if (item.memeId !== memeId || item.observedOn < from) continue;
      const current = byDate.get(item.observedOn) ?? { date: item.observedOn, seen: 0, notSeen: 0 };
      if (item.seen) current.seen += 1;
      else current.notSeen += 1;
      byDate.set(item.observedOn, current);
    }
    return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  }

  private async serialWrite(operation: () => Promise<void>) {
    this.writeQueue = this.writeQueue.then(operation, operation);
    await this.writeQueue;
  }

  private async read(): Promise<MemePulseDocument> {
    try {
      const parsed = JSON.parse(await readFile(this.filePath, "utf8")) as MemePulseDocument;
      return Array.isArray(parsed.items) ? parsed : { items: [] };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { items: [] };
      throw error;
    }
  }

  private async write(document: MemePulseDocument) {
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(document, null, 2)}\n`, { mode: 0o600 });
    await rename(temporaryPath, this.filePath);
  }
}
