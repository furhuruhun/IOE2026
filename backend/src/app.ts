import { Hono } from "hono";
import type { AppContext } from "./env";
import { requestIdMiddleware } from "./middleware/requestId";
import { errorHandler } from "./middleware/errorHandler";
import { ok, fail } from "./lib/response";
import { nowIsoWib } from "./lib/time";

import { authRoutes } from "./modules/auth/routes";
import { profileRoutes } from "./modules/profile/routes";
import { competitionRoutes } from "./modules/competitions/routes";
import { teamRoutes } from "./modules/teams/routes";
import { requirementRoutes } from "./modules/requirements/routes";
import { eventRoutes } from "./modules/events/routes";
import { dashboardRoutes } from "./modules/dashboard/routes";
import { fileRoutes } from "./modules/files/routes";
import { adminRoutes } from "./modules/admin/routes";

export const app = new Hono<AppContext>();

// Global middleware
app.use("*", requestIdMiddleware);
app.use("*", async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  await next();
});

// Health check under /api/health
const api = new Hono<AppContext>();

api.get("/health", (c) => {
  return ok(c, {
    status: "healthy",
    timestamp: nowIsoWib(),
  });
});

// Mount modules
api.route("/auth", authRoutes);
api.route("/profile", profileRoutes);
api.route("/competitions", competitionRoutes);
api.route("/competitions", teamRoutes);
api.route("/competitions", requirementRoutes);
api.route("/events", eventRoutes);
api.route("/dashboard", dashboardRoutes);
api.route("/files", fileRoutes);
api.route("/admin", adminRoutes);

app.route("/api", api);

// Not found handler
app.notFound((c) => {
  return fail(c, "NOT_FOUND", 404, "Endpoint tidak ditemukan");
});

// Error handler
app.onError(errorHandler);
