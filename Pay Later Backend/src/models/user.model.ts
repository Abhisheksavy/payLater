import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  plaidAccessToken?: Schema.Types.Mixed;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plaidAccessToken: { type: Schema.Types.Mixed , default: null}
  },
  { timestamps: true }
);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
