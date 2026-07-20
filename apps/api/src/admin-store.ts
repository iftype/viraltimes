import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type {
  InboxCategory,
  InboxDocument,
  InboxItem,
  InboxStatus,
} from "./admin-types.js";

const emptyDocument: InboxDocument = { items: [] };

export class AdminInboxStore {
  private writeQueue = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async list(): Promise<InboxItem[]> {
    const document = await this.read();
    return document.items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async create(input: {
    category: InboxCategory;
    title: string;
    author: string;
    description: string;
    sourceUrl?: string;
    originUrl?: string;
    subjectId?: string;
  }): Promise<InboxItem> {
    const now = new Date().toISOString();
    const item: InboxItem = {
      id: `inbox-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      status: "new",
      createdAt: now,
      updatedAt: now,
      ...input,
    };

    await this.serialWrite(async () => {
      const document = await this.read();
      document.items.unshift(item);
      await this.write(document);
    });

    return item;
  }

  async updateStatus(id: string, status: InboxStatus): Promise<InboxItem | null> {
    let updated: InboxItem | null = null;

    await this.serialWrite(async () => {
      const document = await this.read();
      const item = document.items.find((candidate) => candidate.id === id);
      if (!item) return;

      item.status = status;
      item.updatedAt = new Date().toISOString();
      updated = item;
      await this.write(document);
    });

    return updated;
  }

  private async serialWrite(operation: () => Promise<void>) {
    this.writeQueue = this.writeQueue.then(operation, operation);
    await this.writeQueue;
  }

  private async read(): Promise<InboxDocument> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as InboxDocument;
      return Array.isArray(parsed.items) ? parsed : { ...emptyDocument };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return { ...emptyDocument };
      }
      throw error;
    }
  }

  private async write(document: InboxDocument) {
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(document, null, 2)}\n`, {
      mode: 0o600,
    });
    await rename(temporaryPath, this.filePath);
  }
}
