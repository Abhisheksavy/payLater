import mongoose, { Schema, Document, Types } from "mongoose";

export interface IReward extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  transactionId?: Types.ObjectId;
  type: "cashback" | "coins";
  amount: number;
  status: "earned" | "redeemed" | "expired";
  description?: string;
}

const rewardSchema = new Schema<IReward>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },
    type: { type: String, enum: ["cashback", "coins"], required: true },
    amount: { type: Number, required: true },
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
