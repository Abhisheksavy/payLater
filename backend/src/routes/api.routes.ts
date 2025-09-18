import { Router } from "express";
import userRoutes from "./user.routes.js";
import plaidRoutes from "./plaid.routes.js";
import quiltRoutes from './quiltt.routes.js';
import billRoutes from './bill.routes.js';
import webhookRoutes from './webhook.routes.js';

const router = Router();

router.use("/user", userRoutes);
router.use("/plaid", plaidRoutes);
router.use("/quiltt", quiltRoutes)
router.use("/bill", billRoutes)
router.use("/webhooks", webhookRoutes)

export default router;
