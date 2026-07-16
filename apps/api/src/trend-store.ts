import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { TrendDocument, TrendSnapshot } from "./trend-types.js";

const snapshotKey = (item: TrendSnapshot) =>
  `${item.memeId}:${item.source}:${item.metric}:${item.observedOn}`;

export class TrendStore {
  private writeQueue = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async list(
    memeId: string,
    filters: { from?: string; to?: string; metric?: string; source?: string },
  ) {
    const document = await this.read();
    return document.items
      .filter((item) => {
        if (item.memeId !== memeId) return false;
        if (filters.from && item.observedOn < filters.from) return false;
        if (filters.to && item.observedOn > filters.to) return false;
        if (filters.metric && item.metric !== filters.metric) return false;
        if (filters.source && item.source !== filters.source) return false;
        return true;
      })
      .sort((a, b) => a.observedOn.localeCompare(b.observedOn));
  }

  async upsertMany(items: TrendSnapshot[]) {
    await this.serialWrite(async () => {
      const document = await this.read();
      const byKey = new Map(document.items.map((item) => [snapshotKey(item), item]));
      for (const item of items) byKey.set(snapshotKey(item), item);
      document.items = [...byKey.values()];
      await this.write(document);
    });
    return items.length;
  }

  private async serialWrite(operation: () => Promise<void>) {
    this.writeQueue = this.writeQueue.then(operation, operation);
    await this.writeQueue;
  }

  private async read(): Promise<TrendDocument> {
    try {
      const parsed = JSON.parse(await readFile(this.filePath, "utf8")) as TrendDocument;
      return Array.isArray(parsed.items) ? parsed : { items: [] };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { items: [] };
      throw error;
    }
  }

  private async write(document: TrendDocument) {
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(document, null, 2)}\n`, { mode: 0o600 });
    await rename(temporaryPath, this.filePath);
  }
}
