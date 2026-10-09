import { authRateLimit } from "./middleware/authRateLimit.js";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import insightRoutes from "./routes/insightRoutes.js";
import ritualRoutes from "./routes/ritualRoutes.js";
import moodRoutes from "./routes/moodRoutes.js";

export function createApp({
  clientOrigin = process.env.CLIENT_ORIGIN || "http://127.0.0.1:5173",
  trustProxy = false,
} = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", trustProxy);
  app.use((_req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Cache-Control": "no-store",
    });
    next();
  });
  app.use(cors({ origin: clientOrigin }));
  app.use(express.json({ limit: "32kb" }));
  const limitAuth = authRateLimit();
  app.use(["/api/auth/login", "/api/auth/register"], limitAuth);
  app.use("/api/auth", authRoutes);
  app.use("/api/moods", moodRoutes);
  app.use("/api/rituals", ritualRoutes);
  app.use("/api/insights", insightRoutes);
  app.get("/api/health", (_request, response) => {
    response.json({ data: { status: "ok", service: "MoodGarden API" } });
  });
  app.use((_request, response) =>
    response
      .status(404)
      .json({ error: { message: "That resource could not be found." } }),
  );
  app.use((error, _request, response, _next) => {
    const status =
      error.code === 11000
        ? 409
        : [400, 401, 404, 409, 413].includes(error.status)
          ? error.status
          : 500;
    if (status === 500) console.error(error);
    const message =
      error.code === 11000
        ? "An account with that email already exists."
        : error.type === "entity.parse.failed"
          ? "Please send valid JSON."
          : status === 413
            ? "The request is too large."
            : status !== 500
              ? error.message
              : "Something went wrong. Please try again.";
    response.status(status).json({ error: { message } });
  });
  return app;
}
