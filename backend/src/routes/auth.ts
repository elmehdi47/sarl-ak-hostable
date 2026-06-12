import { Router } from "express";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import { db, adminsTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { z } from "zod";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many login attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const LoginBody = z.object({ username: z.string(), password: z.string() });

router.post("/auth/login", loginLimiter, async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const { username, password } = parsed.data;
  const [admin] = await db.select().from(adminsTable).where(eq(adminsTable.username, username));
  if (!admin) { res.status(401).json({ error: "Invalid credentials" }); return; }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) { res.status(401).json({ error: "Invalid credentials" }); return; }

  (req.session as any).adminId = admin.id;
  (req.session as any).adminUsername = admin.username;

  res.json({ message: "Logged in successfully", user: { id: admin.id, username: admin.username } });
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json({ message: "Logged out successfully" });
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  const session = req.session as any;
  if (!session.adminId) { res.status(401).json({ error: "Not authenticated" }); return; }
  res.json({ id: session.adminId, username: session.adminUsername });
});

export default router;
