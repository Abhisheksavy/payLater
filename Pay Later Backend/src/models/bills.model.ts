import { Schema, model, Document } from "mongoose";

export interface IBill extends Document {
  userId: string;
  merchant: string;
  description: string;
  avgAmount: number;
  frequency: "monthly" | "weekly" | "biweekly" | "irregular" | null;
  nextDueDate?: Date;
  verified: boolean;
  recurring: boolean;
  billType: "Rent/Mortgage" | "Utilities" | "Subscription" | "Insurance" | "Loan" | "Other Fees" | "Other";
  createdAt: Date;
}

const BillSchema = new Schema<IBill>({
  userId: { type: String, required: true },
  merchant: { type: String, required: true },
  description: { type: String, required: true },
  avgAmount: { type: Number, required: true },
  frequency: {
    type: String,
    enum: ["monthly", "weekly", "biweekly", "irregular"],
    required: true,
    default: null,
  },
  nextDueDate: { type: Date },
  verified: { type: Boolean, default: false },
  recurring: { type: Boolean, default: false },
  billType: {
    type: String,
    enum: [
      "Rent/Mortgage",
      "Utilities",
      "Subscription",
      "Insurance",
      "Loan",
      "Other Fees",
      "Other",
    ],
    default: "Other",
  },
}, { timestamps: true });

export const Bill = model<IBill>("Bill", BillSchema);
