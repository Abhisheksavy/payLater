import mongoose, { Document } from "mongoose";
export interface PendingBillDocument extends Document {
    userId: string;
    billId: string;
    merchant: string;
    description: string;
    nextAmount: number;
    nextPaymentDate: Date;
    lastPaidDate: Date;
    status: "pending" | "paid";
    createdAt: Date;
    updatedAt: Date;
}
export declare const PendingBill: mongoose.Model<PendingBillDocument, {}, {}, {}, mongoose.Document<unknown, {}, PendingBillDocument, {}, {}> & PendingBillDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=pendingBill.model.d.ts.map