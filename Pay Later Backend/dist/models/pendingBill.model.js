import mongoose, { Schema, Document } from "mongoose";
const PendingBillSchema = new Schema({
    userId: { type: String, required: true },
    billId: { type: String, required: true },
    merchant: String,
    description: String,
    nextAmount: Number,
    nextPaymentDate: Date,
    lastPaidDate: Date,
    status: { type: String, enum: ["pending", "paid"], default: "pending" }
}, { timestamps: true });
export const PendingBill = mongoose.model("PendingBill", PendingBillSchema);
//# sourceMappingURL=pendingBill.model.js.map