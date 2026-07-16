import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { Meme, MemeDocument, PublicationStatus, StoredMeme } from "./meme-types.js";

export class MemeStore {
  private writeQueue = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async list(includeUnpublished = false) {
    const document = await this.read();
    return document.items
      .filter((item) => includeUnpublished || item.publicationStatus === "published")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getBySlug(slug: string, includeUnpublished = false) {
    const document = await this.read();
    return (
      document.items.find(
        (item) =>
          item.slug === slug &&
          (includeUnpublished || item.publicationStatus === "published"),
      ) ?? null
    );
  }

  async save(
    meme: Meme,
    publicationStatus: PublicationStatus,
    existingId?: string,
  ): Promise<{ item?: StoredMeme; conflict?: string }> {
    let result: { item?: StoredMeme; conflict?: string } = {};

    await this.serialWrite(async () => {
      const document = await this.read();
      const existingIndex = existingId
        ? document.items.findIndex((item) => item.id === existingId)
        : -1;
      const slugOwner = document.items.find(
        (item, index) => item.slug === meme.slug && index !== existingIndex,
      );
      if (slugOwner) {
        result = { conflict: "이미 사용 중인 slug입니다." };
        return;
      }

      const now = new Date().toISOString();
      const existing = existingIndex >= 0 ? document.items[existingIndex] : undefined;
      const item: StoredMeme = {
        ...meme,
        id: existing?.id ?? meme.id,
        publicationStatus,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      if (existingIndex >= 0) document.items[existingIndex] = item;
      else document.items.push(item);
      await this.write(document);
      result = { item };
    });

    return result;
  }

  private async serialWrite(operation: () => Promise<void>) {
    this.writeQueue = this.writeQueue.then(operation, operation);
    await this.writeQueue;
  }

  private async read(): Promise<MemeDocument> {
    try {
      const parsed = JSON.parse(await readFile(this.filePath, "utf8")) as MemeDocument;
      return Array.isArray(parsed.items) ? parsed : { items: [] };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return { items: [] };
      throw error;
    }
  }

  private async write(document: MemeDocument) {
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(document, null, 2)}\n`, { mode: 0o600 });
    await rename(temporaryPath, this.filePath);
  }
}
