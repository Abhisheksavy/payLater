import { Schema, model, Document } from "mongoose";

export interface ITransaction extends Document {
  userId: string;
  transactionId: string;
  date: Date;
  amount: number;
  description: string;
  merchant?: string | null;
  accountId: string;
  status: string;
}

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: String, required: true },
  transactionId: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  merchant: { type: String, default: null },
  accountId: { type: String, required: true },
  status: { type: String, required: true },
});

export const Transaction = model<ITransaction>("Transaction", TransactionSchema);
