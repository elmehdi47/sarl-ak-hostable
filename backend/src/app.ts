import express, { type Express } from "express";
import cors from "cors";
import session from "express-session";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import router from "./routes/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.set("trust proxy", 1);

app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }));

app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true,
}));

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit({
  windowMs: 60 * 1000, max: 100,
  message: { error: "Too many requests, please slow down" },
  standardHeaders: true, legacyHeaders: false,
}));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET environment variable is required");
}

app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  name: "__sid",
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

app.use("/api", router);

// Serve frontend static files
const frontendDist = path.join(process.cwd(), "../frontend/dist");
const adminDist = path.join(process.cwd(), "../admin/dist");

if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendDist));
  app.use("/admin", express.static(adminDist));

  // SPA fallback for admin
  app.get("/admin/*", (_req, res) => {
    res.sendFile(path.join(adminDist, "index.html"));
  });

  // SPA fallback for frontend (catch-all, must be last)
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

export default app;
