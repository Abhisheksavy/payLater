import mongoose, { Schema, Document } from "mongoose";

export interface ITransactionHistory extends Document {
  userId: string;
  billId: string;
  merchant: string;
  description: string;
  amount: number;
  reward: number;
  paidDate: Date;
  createdAt: Date;
  updatedAt: Date;
  fileUrl: String;
}

const TransactionHistorySchema: Schema<ITransactionHistory> = new Schema(
  {
    userId: { type: String, required: true, index: true },
    billId: { type: String, required: true },
    merchant: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    reward: { type: Number, required: true },
    paidDate: { type: Date, required: true },
    fileUrl: { type: String },
  },
  { timestamps: true }
);

export const TransactionHistory = mongoose.model<ITransactionHistory>(
  "TransactionHistory",
  TransactionHistorySchema
);
