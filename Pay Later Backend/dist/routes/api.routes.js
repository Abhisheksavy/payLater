import { Router } from "express";
import userRoutes from "./user.routes.js";
import plaidRoutes from "./plaid.routes.js";
import rewardRoutes from "./reward.routes.js";
import quiltRoutes from './quiltt.routes.js';
const router = Router();
router.use("/user", userRoutes);
router.use("/plaid", plaidRoutes);
router.use("/reward", rewardRoutes);
router.use("/quiltt", quiltRoutes);
export default router;
//# sourceMappingURL=api.routes.js.map