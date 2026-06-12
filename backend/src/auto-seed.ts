import bcrypt from "bcryptjs";
import { db } from "./db/schema.js";
import { adminsTable, categoriesTable, productsTable } from "./db/schema.js";
import { count } from "drizzle-orm";

export async function autoSeed() {
  try {
    const [adminCount] = await db.select({ total: count() }).from(adminsTable);
    if ((adminCount?.total ?? 0) === 0) {
      const adminUsername = process.env.ADMIN_USERNAME;
      const adminPassword = process.env.ADMIN_PASSWORD;
      if (!adminUsername || !adminPassword) {
        console.warn("ADMIN_USERNAME/ADMIN_PASSWORD not set, skipping admin seed");
        return;
      }
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await db.insert(adminsTable).values({ username: adminUsername, passwordHash }).onConflictDoNothing();
      console.log("Admin user auto-seeded");
    }

    const [catCount] = await db.select({ total: count() }).from(categoriesTable);
    if ((catCount?.total ?? 0) === 0) {
      await db.insert(categoriesTable).values([
        { slug: "office", nameEn: "Office Furniture", nameFr: "Mobilier de Bureau", nameAr: "أثاث مكتبي", descriptionEn: "Premium desks, chairs, and storage solutions for modern workspaces", descriptionFr: "Bureaux, chaises et solutions de rangement haut de gamme", descriptionAr: "مكاتب وكراسي وحلول تخزين فاخرة", iconName: "Briefcase", sortOrder: 1 },
        { slug: "kitchen", nameEn: "Kitchen Fittings", nameFr: "Cuisines Équipées", nameAr: "أثاث المطبخ", descriptionEn: "Custom kitchen cabinets, countertops, and integrated appliance solutions", descriptionFr: "Armoires de cuisine sur mesure, plans de travail et solutions électroménagères", descriptionAr: "خزائن المطبخ المخصصة وأسطح العمل وحلول الأجهزة المدمجة", iconName: "UtensilsCrossed", sortOrder: 2 },
        { slug: "bedroom", nameEn: "Bedroom Collections", nameFr: "Collections Chambre", nameAr: "أثاث غرفة النوم", descriptionEn: "Elegant bedroom suites, wardrobes, and bedside furniture crafted for comfort", descriptionFr: "Suites de chambre élégantes, armoires et mobilier de chevet", descriptionAr: "أجنحة غرف نوم أنيقة وخزائن وأثاث جانبي", iconName: "Bed", sortOrder: 3 },
      ]).onConflictDoNothing();
      console.log("Categories auto-seeded");
    }

    const [prodCount] = await db.select({ total: count() }).from(productsTable);
    if ((prodCount?.total ?? 0) === 0) {
      const allCategories = await db.select().from(categoriesTable);
      const officeId = allCategories.find((c) => c.slug === "office")?.id ?? null;
      const kitchenId = allCategories.find((c) => c.slug === "kitchen")?.id ?? null;
      const bedroomId = allCategories.find((c) => c.slug === "bedroom")?.id ?? null;

      await db.insert(productsTable).values([
        { categoryId: officeId, nameEn: "Executive Walnut Desk", nameFr: "Bureau Exécutif en Noyer", nameAr: "مكتب تنفيذي بخشب الجوز", descriptionEn: "A commanding walnut executive desk with leather inlay and built-in cable management", descriptionFr: "Un imposant bureau exécutif en noyer avec incrustation de cuir", descriptionAr: "مكتب تنفيذي من خشب الجوز الفاخر مع تطعيم جلدي", imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800", featured: true, sortOrder: 1 },
        { categoryId: officeId, nameEn: "Ergonomic Director Chair", nameFr: "Chaise Directeur Ergonomique", nameAr: "كرسي مدير مريح", descriptionEn: "Full-grain leather executive chair with lumbar support and adjustable armrests", descriptionFr: "Chaise exécutive en cuir pleine fleur avec support lombaire", descriptionAr: "كرسي تنفيذي من الجلد الكامل مع دعم قطني", imageUrl: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800", featured: false, sortOrder: 2 },
        { categoryId: kitchenId, nameEn: "Matte White Modern Kitchen", nameFr: "Cuisine Moderne Blanc Mat", nameAr: "مطبخ عصري بالأبيض المطفي", descriptionEn: "Sleek matte white kitchen with integrated handles and soft-close drawers", descriptionFr: "Cuisine blanche mate épurée avec poignées intégrées", descriptionAr: "مطبخ أبيض مطفي أنيق مع مقابض مدمجة", imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", featured: true, sortOrder: 1 },
        { categoryId: kitchenId, nameEn: "Natural Oak Kitchen", nameFr: "Cuisine en Chêne Naturel", nameAr: "مطبخ من خشب البلوط الطبيعي", descriptionEn: "Warm natural oak kitchen cabinets with stone countertop and island", descriptionFr: "Armoires de cuisine en chêne naturel chaud avec plan de travail en pierre", descriptionAr: "خزائن مطبخ دافئة من خشب البلوط الطبيعي مع سطح عمل حجري", imageUrl: "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?w=800", featured: false, sortOrder: 2 },
        { categoryId: bedroomId, nameEn: "Luxury Upholstered Bed", nameFr: "Lit Rembourré de Luxe", nameAr: "سرير مبطن فاخر", descriptionEn: "King-size upholstered bed frame in premium velvet with gold piping", descriptionFr: "Cadre de lit king-size rembourré en velours haut de gamme", descriptionAr: "إطار سرير كبير مبطن بالمخمل الفاخر مع خيوط ذهبية", imageUrl: "https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=800", featured: true, sortOrder: 1 },
        { categoryId: bedroomId, nameEn: "Walk-In Wardrobe System", nameFr: "Système Dressing Walk-In", nameAr: "نظام خزانة ملابس مشي", descriptionEn: "Custom-configured walk-in wardrobe with LED lighting and velvet drawer inserts", descriptionFr: "Dressing walk-in configuré sur mesure avec éclairage LED", descriptionAr: "خزانة ملابس مخصصة مع إضاءة LED ومكملات أدراج مخملية", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", featured: false, sortOrder: 2 },
      ]).onConflictDoNothing();
      console.log("Sample products auto-seeded");
    }

    console.log("Auto-seed check complete");
  } catch (err) {
    console.error("Auto-seed error:", err);
  }
}
