import mongoose, { Schema, Document, Types } from "mongoose";
const transactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    accountId: { type: String, required: true },
    transactionId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    merchantName: { type: String },
    category: [{ type: String }],
    amount: { type: Number, required: true },
    isoCurrencyCode: { type: String, required: true },
    date: { type: String, required: true },
    pending: { type: Boolean, default: false },
    plaidData: { type: Schema.Types.Mixed },
}, { timestamps: true });
const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
//# sourceMappingURL=transactions.model.js.map