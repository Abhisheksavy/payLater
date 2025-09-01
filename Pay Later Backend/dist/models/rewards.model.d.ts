import mongoose, { Document, Types } from "mongoose";
export interface IReward extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    transactionId?: Types.ObjectId;
    type: "cashback" | "coins";
    amount: number;
    status: "earned" | "redeemed" | "expired";
    description?: string;
}
declare const Reward: mongoose.Model<IReward, {}, {}, {}, mongoose.Document<unknown, {}, IReward, {}, {}> & IReward & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default Reward;
//# sourceMappingURL=rewards.model.d.ts.map