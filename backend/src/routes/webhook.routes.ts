import { Router } from "express";
import { webhookController } from "../controller/webhook.controller.js";

const router = Router();

// Quiltt webhook endpoint
// Note: This endpoint should NOT use authCheck middleware since it's called by Quiltt
router.post("/quiltt", webhookController.handleQuilttWebhook);

export default router;