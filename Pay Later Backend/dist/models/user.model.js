import mongoose, { Schema, Document, Types } from "mongoose";
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    quilttUserId: { type: String, unique: true, sparse: true },
    rewardPoints: { type: Number, required: true, default: 0 },
    cashback: { type: Number, required: true, default: 0 },
}, { timestamps: true });
const User = mongoose.model("User", userSchema);
export default User;
//# sourceMappingURL=user.model.js.map