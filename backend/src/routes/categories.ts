import { Router } from "express";
import { db, categoriesTable } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const cats = await db.select().from(categoriesTable).orderBy(categoriesTable.sortOrder);
  res.json(cats);
});

router.post("/categories", requireAdmin, async (req, res): Promise<void> => {
  const { slug, nameEn, nameFr, nameAr, descriptionEn, descriptionFr, descriptionAr, iconName, sortOrder } = req.body;
  if (!slug || !nameEn || !nameFr || !nameAr) { res.status(400).json({ error: "slug, nameEn, nameFr, nameAr are required" }); return; }
  const [cat] = await db.insert(categoriesTable).values({ slug, nameEn, nameFr, nameAr, descriptionEn, descriptionFr, descriptionAr, iconName, sortOrder: sortOrder ?? 0 }).returning();
  res.status(201).json(cat);
});

router.get("/categories/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, id));
  if (!cat) { res.status(404).json({ error: "Category not found" }); return; }
  res.json(cat);
});

router.patch("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { slug, nameEn, nameFr, nameAr, descriptionEn, descriptionFr, descriptionAr, iconName, sortOrder } = req.body;
  const updateData: any = {};
  if (slug !== undefined) updateData.slug = slug;
  if (nameEn !== undefined) updateData.nameEn = nameEn;
  if (nameFr !== undefined) updateData.nameFr = nameFr;
  if (nameAr !== undefined) updateData.nameAr = nameAr;
  if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn;
  if (descriptionFr !== undefined) updateData.descriptionFr = descriptionFr;
  if (descriptionAr !== undefined) updateData.descriptionAr = descriptionAr;
  if (iconName !== undefined) updateData.iconName = iconName;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
  const [cat] = await db.update(categoriesTable).set(updateData).where(eq(categoriesTable.id, id)).returning();
  if (!cat) { res.status(404).json({ error: "Category not found" }); return; }
  res.json(cat);
});

router.delete("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [cat] = await db.delete(categoriesTable).where(eq(categoriesTable.id, id)).returning();
  if (!cat) { res.status(404).json({ error: "Category not found" }); return; }
  res.sendStatus(204);
});

export default router;
