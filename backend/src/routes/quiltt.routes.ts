import { Router } from "express";
import { authCheck } from "../middlewares/AuthCheck.js";
import { quilttController } from "../controller/quiltt.controller.js";

const router = Router();

router.post("/sessions", quilttController.sessions)
// Note: Manual save-connection route removed - now handled by webhooks
router.get("/user-connections", authCheck, quilttController.getUserConnections)
router.delete("/connections/:connectionId", authCheck, quilttController.disconnectConnection)
router.get("/transactions/:profileId", authCheck, quilttController.transactions)
router.get("/accounts/:profileId", authCheck, quilttController.accounts)

export default router;
