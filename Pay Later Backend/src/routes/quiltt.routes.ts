import { Router } from "express";
import { authCheck } from "../middlewares/AuthCheck.js";
import { quilttController } from "../controller/quiltt.controller.js";

const router = Router();

router.post("/sessions", authCheck, quilttController.sessions)
router.get("/transactions/:profileId", authCheck, quilttController.transactions)
router.get("/accounts/:profileId", authCheck, quilttController.accounts)

export default router;
