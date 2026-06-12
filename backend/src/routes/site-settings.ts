import { Router } from "express";
import { pool } from "../db/schema.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

const ALLOWED_KEYS = [
  "hero_1", "hero_2", "hero_3", "about_image",
  "contact_phone", "contact_email", "contact_address", "contact_whatsapp",
];

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL DEFAULT ''
    )
  `);
  await pool.query(`
    INSERT INTO site_settings (key, value)
    VALUES
      ('hero_1',''),('hero_2',''),('hero_3',''),('about_image',''),
      ('contact_phone','+213 661 370 370'),
      ('contact_email','contact@sarl-ak.dz'),
      ('contact_address','Wilaya de Bordj Bou Arréridj (BBA), Algérie'),
      ('contact_whatsapp','213661370370')
    ON CONFLICT (key) DO NOTHING
  `);
}

ensureTable().catch((err) => console.error("site_settings init error:", err));

router.get("/site-settings", async (_req, res): Promise<void> => {
  const result = await pool.query("SELECT key, value FROM site_settings");
  const settings: Record<string, string> = {};
  for (const row of result.rows) settings[row.key] = row.value;
  res.json(settings);
});

router.patch("/site-settings/:key", requireAdmin, async (req, res): Promise<void> => {
  const { key } = req.params;
  if (!ALLOWED_KEYS.includes(key)) { res.status(400).json({ error: "Invalid key" }); return; }
  const { value } = req.body;
  if (typeof value !== "string") { res.status(400).json({ error: "value must be a string" }); return; }
  if (value.length > 2000) { res.status(400).json({ error: "value too long" }); return; }
  await pool.query(
    `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, value]
  );
  res.json({ key, value });
});

export default router;
