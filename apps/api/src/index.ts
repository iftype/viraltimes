import cors from "@fastify/cors";
import Fastify from "fastify";

import { AdminAuth } from "./admin-auth.js";
import { AdminInboxStore } from "./admin-store.js";
import { CategoryStore } from "./category-store.js";
import { MemeStore } from "./meme-store.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { registerCategoryRoutes } from "./routes/categories.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerIntakeRoutes } from "./routes/intake.js";
import { registerMemeRoutes } from "./routes/memes.js";

const app = Fastify({ logger: true, trustProxy: true });
const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 4000);
const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:3000";
const adminOrigin = process.env.ADMIN_ORIGIN ?? "http://localhost:3100";
const adminAuth = new AdminAuth(
  process.env.ADMIN_PASSWORD_HASH ?? "",
  process.env.ADMIN_SESSION_SECRET ?? "",
  process.env.ADMIN_COOKIE_PATH ?? "/viral",
);
const inboxStore = new AdminInboxStore(
  process.env.ADMIN_DATA_FILE ?? "/opt/origin/shared/admin-inbox.json",
);
const memeStore = new MemeStore(
  process.env.MEME_DATA_FILE ?? "/opt/origin/shared/memes.json",
);
const categoryStore = new CategoryStore(
  process.env.CATEGORY_DATA_FILE ?? "/opt/origin/shared/categories.json",
);

await app.register(cors, {
  origin:
    corsOrigin === "*"
      ? true
      : corsOrigin.split(",").map((origin) => origin.trim()),
});

registerHealthRoutes(app);
registerCategoryRoutes(app, categoryStore);
registerMemeRoutes(app, memeStore, categoryStore);
registerIntakeRoutes(app, inboxStore);
registerAdminRoutes(app, { adminAuth, adminOrigin, categoryStore, inboxStore, memeStore });

const stop = async (signal: string) => {
  app.log.info({ signal }, "shutting down");
  await app.close();
  process.exit(0);
};

process.on("SIGINT", () => void stop("SIGINT"));
process.on("SIGTERM", () => void stop("SIGTERM"));

await app.listen({ host, port });
