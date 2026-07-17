import cors from "@fastify/cors";
import Fastify from "fastify";

import { AdminAuth } from "./admin-auth.js";
import { AdminInboxStore } from "./admin-store.js";
import { CategoryStore } from "./category-store.js";
import { MemeStore } from "./meme-store.js";
import { ParticipationStore } from "./participation-store.js";
import { TrendStore } from "./trend-store.js";
import { QuizStore } from "./quiz-store.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { registerCategoryRoutes } from "./routes/categories.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerIntakeRoutes } from "./routes/intake.js";
import { registerMemeRoutes } from "./routes/memes.js";
import { registerParticipationRoutes } from "./routes/participation.js";
import { registerSeoRoutes } from "./routes/seo.js";
import { registerTrendRoutes } from "./routes/trends.js";
import { registerQuizRoutes } from "./routes/quiz.js";

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
const participationStore = new ParticipationStore(
  process.env.PARTICIPATION_DATA_FILE ?? "/opt/origin/shared/participation.json",
);
const trendStore = new TrendStore(
  process.env.TREND_DATA_FILE ?? "/opt/origin/shared/trend-snapshots.json",
);
const quizStore = new QuizStore(
  process.env.QUIZ_LOG_FILE ?? "./.data/quiz-logs.json",
);

await app.register(cors, {
  origin:
    corsOrigin === "*"
      ? true
      : corsOrigin.split(",").map((origin) => origin.trim()),
});

registerHealthRoutes(app);
registerCategoryRoutes(app, categoryStore);
registerMemeRoutes(app, memeStore, categoryStore, participationStore);
registerIntakeRoutes(app, inboxStore);
registerParticipationRoutes(app, { inboxStore, memeStore, participationStore });
registerSeoRoutes(app, memeStore);
registerTrendRoutes(app, {
  ingestToken: process.env.TREND_INGEST_TOKEN ?? "",
  memeStore,
  trendStore,
});
registerQuizRoutes(app, quizStore, memeStore);
registerAdminRoutes(app, { adminAuth, adminOrigin, categoryStore, inboxStore, memeStore, quizStore });

const stop = async (signal: string) => {
  app.log.info({ signal }, "shutting down");
  await app.close();
  process.exit(0);
};

process.on("SIGINT", () => void stop("SIGINT"));
process.on("SIGTERM", () => void stop("SIGTERM"));

await app.listen({ host, port });
