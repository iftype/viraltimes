import { readFile } from "node:fs/promises";

import { sampleMemes } from "../apps/web/src/data/sample-memes.ts";

const apiBase = process.env.ADMIN_API_BASE;
const password = process.env.ADMIN_PASSWORD;
const extraFile = process.env.EXTRA_MEME_FILE;

if (!apiBase || !password) {
  throw new Error("ADMIN_API_BASE and ADMIN_PASSWORD are required.");
}

async function main() {
const origin = new URL(apiBase).origin;
const loginResponse = await fetch(`${apiBase}/admin/login`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: origin },
  body: JSON.stringify({ password }),
});
if (!loginResponse.ok) throw new Error(`Admin login failed: ${loginResponse.status}`);

const cookie = loginResponse.headers.get("set-cookie")?.split(";", 1)[0];
if (!cookie) throw new Error("Admin session cookie was not returned.");

const listResponse = await fetch(`${apiBase}/admin/memes`, {
  headers: { Cookie: cookie },
});
if (!listResponse.ok) throw new Error(`Catalog read failed: ${listResponse.status}`);
const existing = (await listResponse.json()) as {
  items: Array<{ id: string; slug: string }>;
};

let extraMemes: unknown[] = [];
if (extraFile) {
  const parsed = JSON.parse(await readFile(extraFile, "utf8")) as unknown;
  extraMemes = Array.isArray(parsed) ? parsed : [parsed];
}

const memes = [
  ...sampleMemes.map((meme) => ({ ...meme, publicationStatus: "published" })),
  ...extraMemes,
];

for (const meme of memes) {
  const input = meme as { slug?: string };
  if (!input.slug) throw new Error("Every meme needs a slug.");
  const current = existing.items.find((item) => item.slug === input.slug);
  const response = await fetch(
    current
      ? `${apiBase}/admin/memes/${encodeURIComponent(current.id)}`
      : `${apiBase}/admin/memes`,
    {
      method: current ? "PUT" : "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie,
        Origin: origin,
      },
      body: JSON.stringify(meme),
    },
  );
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${input.slug} seed failed (${response.status}): ${detail}`);
  }
  console.log(`${current ? "updated" : "created"}: ${input.slug}`);
}
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
