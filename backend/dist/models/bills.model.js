import { Schema, model, Document } from "mongoose";
const BillSchema = new Schema({
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
export const Bill = model("Bill", BillSchema);
//# sourceMappingURL=bills.model.js.map