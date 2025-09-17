import { Document } from "mongoose";
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
export declare const Transaction: import("mongoose").Model<ITransaction, {}, {}, {}, Document<unknown, {}, ITransaction, {}, {}> & ITransaction & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=transactions.model.d.ts.map