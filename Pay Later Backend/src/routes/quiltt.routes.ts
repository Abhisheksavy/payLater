import { Router } from "express";
import { authCheck } from "../middlewares/AuthCheck.js";
import { quilttController } from "../controller/quiltt.controller.js";

const router = Router();

router.post("/sessions", quilttController.sessions)
router.get("/transactions/:profileId", quilttController.transactions)
router.get("/accounts/:profileId", quilttController.accounts)

export default router;
