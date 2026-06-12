import { Router } from "express";
import { db, productsTable } from "../db/schema.js";
import { eq, and, count } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = Router();

router.get("/products", async (req, res): Promise<void> => {
  const { categoryId, featured, page, limit } = req.query as any;

  if ((page && !limit) || (!page && limit)) {
    res.status(400).json({ error: "Both 'page' and 'limit' must be provided together" });
    return;
  }

  const conditions: any[] = [];
  if (categoryId != null) conditions.push(eq(productsTable.categoryId, parseInt(categoryId, 10)));
  if (featured != null) conditions.push(eq(productsTable.featured, featured === "true"));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  if (page && limit) {
    const p = parseInt(page, 10);
    const l = parseInt(limit, 10);
    const offset = (p - 1) * l;

    const [products, totalResult] = await Promise.all([
      db.select().from(productsTable).where(whereClause).orderBy(productsTable.sortOrder).limit(l).offset(offset),
      db.select({ total: count() }).from(productsTable).where(whereClause),
    ]);

    const total = totalResult[0]?.total ?? 0;
    res.json({ products, total, page: p, limit: l, totalPages: Math.ceil(total / l) });
  } else {
    const products = await db.select().from(productsTable).where(whereClause).orderBy(productsTable.sortOrder);
    res.json(products);
  }
});

router.post("/products", requireAdmin, async (req, res): Promise<void> => {
  const { nameEn, nameFr, nameAr, descriptionEn, descriptionFr, descriptionAr, imageUrl, price, featured, sortOrder, categoryId } = req.body;
  if (!nameEn || !nameFr || !nameAr) { res.status(400).json({ error: "nameEn, nameFr, nameAr are required" }); return; }
  const [product] = await db.insert(productsTable).values({
    nameEn, nameFr, nameAr, descriptionEn, descriptionFr, descriptionAr,
    imageUrl, price: price ?? 0, featured: featured ?? false,
    sortOrder: sortOrder ?? 0, categoryId: categoryId ?? null,
  }).returning();
  res.status(201).json(product);
});

router.get("/products/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(product);
});

router.patch("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const { nameEn, nameFr, nameAr, descriptionEn, descriptionFr, descriptionAr, imageUrl, price, featured, sortOrder, categoryId } = req.body;
  const updateData: any = {};
  if (nameEn !== undefined) updateData.nameEn = nameEn;
  if (nameFr !== undefined) updateData.nameFr = nameFr;
  if (nameAr !== undefined) updateData.nameAr = nameAr;
  if (descriptionEn !== undefined) updateData.descriptionEn = descriptionEn;
  if (descriptionFr !== undefined) updateData.descriptionFr = descriptionFr;
  if (descriptionAr !== undefined) updateData.descriptionAr = descriptionAr;
  if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
  if (price !== undefined) updateData.price = price;
  if (featured !== undefined) updateData.featured = featured;
  if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
  if (categoryId !== undefined) updateData.categoryId = categoryId;
  const [product] = await db.update(productsTable).set(updateData).where(eq(productsTable.id, id)).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.json(product);
});

router.delete("/products/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }
  const [product] = await db.delete(productsTable).where(eq(productsTable.id, id)).returning();
  if (!product) { res.status(404).json({ error: "Product not found" }); return; }
  res.sendStatus(204);
});

export default router;
