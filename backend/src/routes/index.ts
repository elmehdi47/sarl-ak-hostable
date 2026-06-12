import { Router } from "express";
import healthRouter from "./health.js";
import authRouter from "./auth.js";
import categoriesRouter from "./categories.js";
import productsRouter from "./products.js";
import contactRouter from "./contact.js";
import storageRouter from "./storage.js";
import ordersRouter from "./orders.js";
import siteSettingsRouter from "./site-settings.js";

const router = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(contactRouter);
router.use(storageRouter);
router.use(ordersRouter);
router.use(siteSettingsRouter);

export default router;
