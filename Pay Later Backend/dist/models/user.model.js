import mongoose, { Schema, Document, Types } from "mongoose";
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    quilttExternalId: { type: String, unique: true, sparse: true },
    quilttPid: { type: String, unique: true, sparse: true },
    quilttUserUuid: { type: String, unique: true, sparse: true },
    quilttConnections: [{ type: String }],
    rewardPoints: { type: Number, required: true, default: 0 },
    cashback: { type: Number, required: true, default: 0 },
}, { timestamps: true });
const User = mongoose.model("User", userSchema);
export default User;
//# sourceMappingURL=user.model.js.map