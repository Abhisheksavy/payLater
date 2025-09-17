import mongoose, { Document } from "mongoose";
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
export declare const TransactionHistory: mongoose.Model<ITransactionHistory, {}, {}, {}, mongoose.Document<unknown, {}, ITransactionHistory, {}, {}> & ITransactionHistory & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=transactionHistory.model.d.ts.map