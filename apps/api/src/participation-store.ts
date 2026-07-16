import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type {
  ParticipationDocument,
  ParticipationEntry,
  ParticipationType,
  ProposalSection,
} from "./participation-types.js";

export class ParticipationStore {
  private writeQueue = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async list(memeId: string, type: ParticipationType) {
    const document = await this.read();
    return document.items
      .filter((item) => item.memeId === memeId && item.type === type && item.status !== "hidden")
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async counts(memeIds: string[]) {
    const requestedIds = new Set(memeIds);
    const result = Object.fromEntries(
      memeIds.map((id) => [id, { commentCount: 0, proposalCount: 0 }]),
    ) as Record<string, { commentCount: number; proposalCount: number }>;
    const document = await this.read();
    for (const item of document.items) {
      if (!requestedIds.has(item.memeId) || item.status === "hidden") continue;
      if (!result[item.memeId]) result[item.memeId] = { commentCount: 0, proposalCount: 0 };
      if (item.type === "comment") result[item.memeId].commentCount += 1;
      else result[item.memeId].proposalCount += 1;
    }
    return result;
  }

  async create(input: {
    type: ParticipationType;
    memeId: string;
    author: string;
    body: string;
    section?: ProposalSection;
    action?: string;
    evidenceUrl?: string;
  }) {
    const now = new Date().toISOString();
    const item: ParticipationEntry = {
      id: `participation-${randomUUID()}`,
      ...input,
      status: input.type === "proposal" ? "pending" : "visible",
      createdAt: now,
      updatedAt: now,
    };
    await this.serialWrite(async () => {
      const document = await this.read();
      document.items.unshift(item);
      await this.write(document);
    });
    return item;
  }

  private async serialWrite(operation: () => Promise<void>) {
    this.writeQueue = this.writeQueue.then(operation, operation);
    await this.writeQueue;
  }

  private async read(): Promise<ParticipationDocument> {
    try {
      const parsed = JSON.parse(await readFile(this.filePath, "utf8")) as ParticipationDocument;
      return Array.isArray(parsed.items) ? parsed : { items: [] };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { items: [] };
      throw error;
    }
  }

  private async write(document: ParticipationDocument) {
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(document, null, 2)}\n`, { mode: 0o600 });
    await rename(temporaryPath, this.filePath);
  }
}
