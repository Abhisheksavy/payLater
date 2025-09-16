import { Router } from "express";
import { RecurringBillController } from "../controller/bill.controller.js";
import { authCheck } from "../middlewares/AuthCheck.js";
import multer from "multer";
const router = Router();
const billController = new RecurringBillController();
router.post("/detect", authCheck, billController.detect);
router.get("/", authCheck, billController.getAll);
router.get("/frequency/:type", authCheck, billController.getByFrequency);
router.get("/recurring/true", authCheck, billController.getRecurring);
router.get("/recurring/false", authCheck, billController.getNonRecurring);
router.get("/upcoming", authCheck, billController.getUpcoming);
router.get("/generateUpcoming", authCheck, billController.getUpcoming);
router.post("/payBill", authCheck, billController.payBill);
const upload = multer({ dest: "uploads/" });
router.post("/verifyBillPayment", authCheck, upload.single("bill"), billController.verifyBillPayment);
export default router;
//# sourceMappingURL=bill.routes.js.map