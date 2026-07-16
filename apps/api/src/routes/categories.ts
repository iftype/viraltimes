import type { FastifyInstance } from "fastify";

import type { CategoryStore } from "../category-store.js";

export function registerCategoryRoutes(app: FastifyInstance, categoryStore: CategoryStore) {
  app.get("/api/v1/categories", async (_request, reply) => {
    reply.header("Cache-Control", "no-store");
    return { items: await categoryStore.list() };
  });
}
