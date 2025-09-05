import mongoose, { Schema, Document } from "mongoose";

export interface PendingBillDocument extends Document {
  userId: string;
  billId: string; // reference to original Bill
  merchant: string;
  description: string;
  nextAmount: number;
  nextPaymentDate: Date;
  lastPaidDate: Date;
  status: "pending" | "paid";
  createdAt: Date;
  updatedAt: Date;
}

const PendingBillSchema = new Schema<PendingBillDocument>({
  userId: { type: String, required: true },
  billId: { type: String, required: true },
  merchant: String,
  description: String,
  nextAmount: Number,
  nextPaymentDate: Date,
  lastPaidDate: Date,
  status: { type: String, enum: ["pending", "paid"], default: "pending" }
}, { timestamps: true });

export const PendingBill = mongoose.model<PendingBillDocument>("PendingBill", PendingBillSchema);
