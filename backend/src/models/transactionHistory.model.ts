import mongoose, { Schema, Document } from "mongoose";

export interface ITransactionHistory extends Document {
  userId: string;
  billId: string;
  merchant: string;
  description: string;
  amount: number;
  paidDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionHistorySchema: Schema<ITransactionHistory> = new Schema(
  {
    userId: { type: String, required: true, index: true },
    billId: { type: String, required: true },
    merchant: { type: String, required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    paidDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export const TransactionHistory = mongoose.model<ITransactionHistory>(
  "TransactionHistory",
  TransactionHistorySchema
);
