import { Router } from "express";
import { plaidController } from "../controller/plaid.controller.js";
import { authCheck } from "../middlewares/AuthCheck.js";

const router = Router();

// Route : /api/plaid/create_link_token -> frontend gets link_token
router.post("/create_link_token", authCheck, plaidController.createLinkToken)

// Route : /api/plaid/exchange_public_token -> exchange for access_token
router.post("/exchange_public_token", authCheck, plaidController.exchangePublicToken)

// Route : /api/plaid/accounts -> fetch account balances
router.get("/accounts", authCheck, plaidController.accounts)

// Route : /api/plaid/transactions -> fetch transactions
router.get("/transactions", authCheck, plaidController.transactions)

// Route : /api/plaid/recurring_transactions -> fetch recurring transactions
router.get("/recurring_transactions", authCheck, plaidController.recurringTransactions)

export default router;
