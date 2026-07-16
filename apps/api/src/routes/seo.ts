import type { FastifyInstance } from "fastify";

import type { MemeStore } from "../meme-store.js";

const xmlEscape = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

export function registerSeoRoutes(app: FastifyInstance, memeStore: MemeStore) {
  app.get("/api/v1/sitemap.xml", async (_request, reply) => {
    const origin = (process.env.PUBLIC_WEB_ORIGIN ?? "https://viralorigin.vercel.app").replace(/\/$/, "");
    const items = await memeStore.list();
    const urls = [
      `<url><loc>${xmlEscape(origin)}</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
      ...items.map(
        (item) => `<url><loc>${xmlEscape(`${origin}/memes/${item.slug}`)}</loc><lastmod>${xmlEscape(item.updatedAt.slice(0, 10))}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
      ),
    ];
    reply.header("Content-Type", "application/xml; charset=utf-8");
    reply.header("Cache-Control", "public, max-age=300");
    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`;
  });
}
