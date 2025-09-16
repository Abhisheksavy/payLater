import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReward extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  transactionHistoryId: Types.ObjectId;
  amount: number;
  cashback: number;
  status: "earned" | "redeemed" | "expired";
  description?: string;
}

const rewardSchema = new Schema<IReward>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    transactionHistoryId: { type: Schema.Types.ObjectId, ref: "TransactionHistory", required: true },
    amount: { type: Number, required: true },
    cashback: {type: Number, required: true},
    status: {
      type: String,
      enum: ["earned", "redeemed", "expired"],
      default: "earned",
    },
    description: { type: String },
  },
  { timestamps: true }
);

const Reward = mongoose.model<IReward>("Reward", rewardSchema);

export default Reward;
