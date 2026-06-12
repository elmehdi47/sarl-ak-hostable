import { Router } from "express";
import rateLimit from "express-rate-limit";
import { db, ordersTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin.js";

const VALID_STATUSES = ["pending", "confirmed", "delivered", "cancelled"];

const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, max: 10,
  message: { error: "Too many orders submitted, please try again later" },
  standardHeaders: true, legacyHeaders: false,
});

const router = Router();

router.get("/orders", requireAdmin, async (_req, res): Promise<void> => {
  const orders = await db.select().from(ordersTable).orderBy(ordersTable.createdAt);
  res.json(orders.reverse());
});

router.post("/orders", orderLimiter, async (req, res): Promise<void> => {
  const { customerName, phone, email, items, totalAmount } = req.body;
  if (!customerName || typeof customerName !== "string" || !customerName.trim()) { res.status(400).json({ error: "customerName is required" }); return; }
  if (customerName.trim().length > 200) { res.status(400).json({ error: "customerName too long" }); return; }
  if (!phone || typeof phone !== "string" || !phone.trim()) { res.status(400).json({ error: "phone is required" }); return; }
  if (phone.trim().length > 30) { res.status(400).json({ error: "phone too long" }); return; }
  if (!Array.isArray(items) || items.length === 0) { res.status(400).json({ error: "items must be a non-empty array" }); return; }
  if (items.length > 50) { res.status(400).json({ error: "Too many items" }); return; }
  if (typeof totalAmount !== "number" || totalAmount < 0 || totalAmount > 999999999) { res.status(400).json({ error: "totalAmount must be a valid non-negative number" }); return; }

  const [order] = await db.insert(ordersTable).values({
    customerName: customerName.trim().slice(0, 200),
    phone: phone.trim().slice(0, 30),
    email: email && typeof email === "string" ? email.trim().slice(0, 254) || null : null,
    items: items as any, totalAmount, status: "pending",
  }).returning();

  res.status(201).json(order);
});

router.get("/orders/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [order] = await db.select().from(ordersTable).where(eq(ordersTable.id, id));
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(order);
});

router.patch("/orders/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { status } = req.body;
  if (!status || typeof status !== "string" || !VALID_STATUSES.includes(status)) {
    res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(", ")}` }); return;
  }
  const [order] = await db.update(ordersTable).set({ status }).where(eq(ordersTable.id, id)).returning();
  if (!order) { res.status(404).json({ error: "Order not found" }); return; }
  res.json(order);
});

export default router;
