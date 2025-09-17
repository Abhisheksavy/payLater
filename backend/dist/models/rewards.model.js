import mongoose, { Schema, Document, Types } from "mongoose";
const rewardSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    transactionHistoryId: { type: Schema.Types.ObjectId, ref: "TransactionHistory", required: true },
    amount: { type: Number, required: true },
    cashback: { type: Number, required: true },
    status: {
        type: String,
        enum: ["earned", "redeemed", "expired"],
        default: "earned",
    },
    description: { type: String },
}, { timestamps: true });
const Reward = mongoose.model("Reward", rewardSchema);
export default Reward;
//# sourceMappingURL=rewards.model.js.map