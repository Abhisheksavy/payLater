import mongoose, { Schema, Document } from "mongoose";
const TransactionHistorySchema = new Schema({
    userId: { type: String, required: true, index: true },
    billId: { type: String, required: true },
    merchant: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidDate: { type: Date, required: true },
}, { timestamps: true });
export const TransactionHistory = mongoose.model("TransactionHistory", TransactionHistorySchema);
//# sourceMappingURL=transactionHistory.model.js.map