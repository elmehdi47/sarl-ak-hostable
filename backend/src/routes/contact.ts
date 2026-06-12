import { Router } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { db, inquiriesTable } from "../db/schema.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 5,
  message: { error: "Too many messages submitted, please try again later" },
  standardHeaders: true, legacyHeaders: false,
});

const ContactBody = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(254),
  phone: z.string().max(30).optional(),
  message: z.string().min(1).max(5000),
});

const router = Router();

router.post("/contact", contactLimiter, async (req, res): Promise<void> => {
  const parsed = ContactBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }
  await db.insert(inquiriesTable).values(parsed.data);
  res.json({ message: "Your inquiry has been received. We will contact you shortly." });
});

router.get("/inquiries", requireAdmin, async (_req, res): Promise<void> => {
  const inquiries = await db.select().from(inquiriesTable).orderBy(inquiriesTable.createdAt);
  res.json(inquiries);
});

export default router;
