import { Document } from "mongoose";
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
export declare const Bill: import("mongoose").Model<IBill, {}, {}, {}, Document<unknown, {}, IBill, {}, {}> & IBill & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=bills.model.d.ts.map