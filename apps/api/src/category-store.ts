import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import { defaultCategories } from "./category-defaults.js";
import type { Category, CategoryDocument, CategoryInput } from "./category-types.js";

export class CategoryStore {
  private writeQueue = Promise.resolve();

  constructor(private readonly filePath: string) {}

  async list(includeInactive = false) {
    const document = await this.read();
    return document.items
      .filter((item) => includeInactive || item.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, "ko"));
  }

  async resolveId(idOrSlug: string) {
    const category = (await this.list(true)).find(
      (item) => item.id === idOrSlug || item.slug === idOrSlug,
    );
    return category?.id ?? null;
  }

  async save(input: CategoryInput, existingId?: string) {
    let result: { item?: Category; conflict?: string } = {};
    await this.serialWrite(async () => {
      const document = await this.read();
      const existingIndex = existingId
        ? document.items.findIndex((item) => item.id === existingId)
        : -1;
      if (existingId && existingIndex < 0) return;
      const slugOwner = document.items.find(
        (item, index) => item.slug === input.slug && index !== existingIndex,
      );
      if (slugOwner) {
        result = { conflict: "이미 사용 중인 카테고리 slug입니다." };
        return;
      }
      const now = new Date().toISOString();
      const previous = existingIndex >= 0 ? document.items[existingIndex] : undefined;
      const item: Category = {
        ...input,
        id: previous?.id ?? `category-${randomUUID()}`,
        createdAt: previous?.createdAt ?? now,
        updatedAt: now,
      };
      if (existingIndex >= 0) document.items[existingIndex] = item;
      else document.items.push(item);
      await this.write(document);
      result = { item };
    });
    return result;
  }

  async ensureDefaults() {
    await this.serialWrite(async () => {
      const document = await this.read();
      const existingIds = new Set(document.items.map((item) => item.id));
      const existingSlugs = new Set(document.items.map((item) => item.slug));
      const missing = defaultCategories.filter(
        (category) => !existingIds.has(category.id) && !existingSlugs.has(category.slug),
      );
      if (!missing.length) return;
      document.items.push(...structuredClone(missing));
      await this.write(document);
    });
  }

  private async serialWrite(operation: () => Promise<void>) {
    this.writeQueue = this.writeQueue.then(operation, operation);
    await this.writeQueue;
  }

  private async read(): Promise<CategoryDocument> {
    try {
      const parsed = JSON.parse(await readFile(this.filePath, "utf8")) as CategoryDocument;
      return Array.isArray(parsed.items) ? parsed : { items: structuredClone(defaultCategories) };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return { items: structuredClone(defaultCategories) };
      }
      throw error;
    }
  }

  private async write(document: CategoryDocument) {
    await mkdir(dirname(this.filePath), { recursive: true });
    const temporaryPath = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporaryPath, `${JSON.stringify(document, null, 2)}\n`, { mode: 0o600 });
    await rename(temporaryPath, this.filePath);
  }
}
