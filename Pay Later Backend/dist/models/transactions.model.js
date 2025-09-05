import { Schema, model, Document } from "mongoose";
const TransactionSchema = new Schema({
    userId: { type: String, required: true },
    transactionId: { type: String, required: true },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    merchant: { type: String, default: null },
    accountId: { type: String, required: true },
    status: { type: String, required: true },
});
export const Transaction = model("Transaction", TransactionSchema);
//# sourceMappingURL=transactions.model.js.map