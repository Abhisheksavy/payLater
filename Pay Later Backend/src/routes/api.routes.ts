import { Router } from "express";
import userRoutes from "./user.routes.js";
import plaidRoutes from "./plaid.routes.js";
import rewardRoutes from "./reward.routes.js";
import quiltRoutes from './quiltt.routes.js';
import billRoutes from './bill.routes.js';

const router = Router();

router.use("/user", userRoutes);
router.use("/plaid", plaidRoutes);
router.use("/reward", rewardRoutes);
router.use("/quiltt", quiltRoutes)
router.use("/bill", billRoutes)

export default router;
