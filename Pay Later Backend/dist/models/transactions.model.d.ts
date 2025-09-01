import mongoose, { Document, Types } from "mongoose";
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
declare const Transaction: mongoose.Model<ITransaction, {}, {}, {}, mongoose.Document<unknown, {}, ITransaction, {}, {}> & ITransaction & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Transaction;
//# sourceMappingURL=transactions.model.d.ts.map