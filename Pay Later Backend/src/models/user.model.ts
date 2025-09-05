import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  quilttUserId: string;
  rewardPoints: number;
  cashback: number;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    quilttUserId: { type: String, unique: true, sparse: true },
    rewardPoints: { type: Number, required: true, default: 0 },
    cashback: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
