import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import type { Meme, MemeDocument, PublicationStatus, StoredMeme } from "./meme-types.js";
import { legacyCategoryIds } from "./category-defaults.js";

export class MemeStore {
  private writeQueue = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async list(includeUnpublished = false) {
    const document = await this.read();
    return document.items
      .map((item) => ({
        ...item,
        categoryIds: legacyCategoryIds(item),
        sourceLinks: item.sourceLinks ?? [],
      }))
      .filter((item) => includeUnpublished || item.publicationStatus === "published")
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async getBySlug(slug: string, includeUnpublished = false) {
    const document = await this.read();
    const item = document.items.find(
      (candidate) =>
        candidate.slug === slug &&
        (includeUnpublished || candidate.publicationStatus === "published"),
    );
    return item
      ? {
          ...item,
          categoryIds: legacyCategoryIds(item),
          sourceLinks: item.sourceLinks ?? [],
        }
      : null;
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

  async delete(id: string): Promise<boolean> {
    let deleted = false;
    await this.serialWrite(async () => {
      const document = await this.read();
      const existingIndex = document.items.findIndex((item) => item.id === id);
      if (existingIndex >= 0) {
        document.items.splice(existingIndex, 1);
        await this.write(document);
        deleted = true;
      }
    });
    return deleted;
  }

  async bulkManage(
    ids: string[],
    operation:
      | { action: "status"; publicationStatus: PublicationStatus }
      | { action: "delete" }
      | { action: "add-category" | "remove-category"; categoryId: string },
  ): Promise<{ items: StoredMeme[]; deletedIds: string[]; missingIds: string[] }> {
    const requestedIds = [...new Set(ids)];
    let result = { items: [] as StoredMeme[], deletedIds: [] as string[], missingIds: [] as string[] };

    await this.serialWrite(async () => {
      const document = await this.read();
      const existingIds = new Set(document.items.map((item) => item.id));
      const requestedSet = new Set(requestedIds);
      result.missingIds = requestedIds.filter((id) => !existingIds.has(id));

      if (operation.action === "delete") {
        result.deletedIds = document.items
          .filter((item) => requestedSet.has(item.id))
          .map((item) => item.id);
        document.items = document.items.filter((item) => !requestedSet.has(item.id));
      } else {
        const now = new Date().toISOString();
        document.items = document.items.map((item) => {
          if (!requestedSet.has(item.id)) return item;
          const updated: StoredMeme = operation.action === "status"
            ? { ...item, publicationStatus: operation.publicationStatus, updatedAt: now }
            : {
                ...item,
                categoryIds: operation.action === "add-category"
                  ? [...new Set([...item.categoryIds, operation.categoryId])]
                  : item.categoryIds.filter((id) => id !== operation.categoryId),
                updatedAt: now,
              };
          result.items.push(updated);
          return updated;
        });
      }

      await this.write(document);
    });

    return result;
  }
}
