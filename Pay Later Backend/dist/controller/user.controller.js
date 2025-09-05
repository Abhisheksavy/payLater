import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { signAccessToken } from "../utils/jwt.js";
import { v4 as uuidv4 } from "uuid";
class UserController {
    async register(req, res) {
        try {
            const { name, email, password } = req.body;
            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: "User already exists" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({ name, email, password: hashedPassword, quilttUserId: uuidv4() });
            const token = signAccessToken({ id: user._id.toString(), email: user.email });
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000,
            });
            return res.json({ id: user._id, name, email, createdAt: user.createdAt });
        }
        catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: "Invalid credentials" });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: "Invalid credentials" });
            }
            const token = signAccessToken({ id: user._id.toString(), email: user.email });
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000,
            });
            return res.json({ id: user._id, name: user.name, email, createdAt: user.createdAt });
        }
        catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
    }
    async logout(req, res) {
        try {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
            res.json({ message: "Logged out successfully" });
        }
        catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    }
    async verify(req, res) {
        try {
            if (!req.userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const user = await User.findById(req.userId).select("_id name email createdAt");
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            return res.status(200).json({
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            });
        }
        catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
    }
}
export const userController = new UserController();
//# sourceMappingURL=user.controller.js.map