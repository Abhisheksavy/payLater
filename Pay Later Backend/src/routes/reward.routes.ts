import { Router } from "express";
import { rewardController } from "../controller/reward.controller.js";
import { authCheck } from "../middlewares/AuthCheck.js";

const router = Router();

// Route : /api/reward/get_reward -> sends reward to backend
router.post("/get_reward", rewardController.reward)

export default router;
