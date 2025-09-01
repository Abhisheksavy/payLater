import mongoose, { Schema, Document, Types } from "mongoose";

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  accountId: string;
  transactionId: string;
  name: string;
  merchantName?: string;
  category?: string[];
  amount: number;
  isoCurrencyCode: string;
  date: string;
  pending: boolean;
  plaidData: any;
}

const transactionSchema = new Schema<ITransaction>(
  {
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
  },
  { timestamps: true }
);

const Transaction = mongoose.model<ITransaction>(
  "Transaction",
  transactionSchema
);

export default Transaction;
