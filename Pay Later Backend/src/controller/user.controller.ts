import type { Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { signAccessToken } from "../utils/jwt.js";

class UserController {

    public async register(req: Request, res: Response): Promise<Response> {
        try {
            const { name, email, password } = req.body;

            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ message: "User already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await User.create({ name, email, password: hashedPassword });

            const token = signAccessToken({ id: user._id.toString(), email: user.email });

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 24 * 60 * 60 * 1000,
            });

            return res.json({ id: user._id, name, email, createdAt: user.createdAt});
        } catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
    }

    public async login(req: Request, res: Response): Promise<Response> {
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
        } catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
    }

    public async logout(req: Request, res: Response): Promise<void> {
        try {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
            res.json({ message: "Logged out successfully" });
        } catch (err) {
            res.status(500).json({ message: "Server error" });
        }
    }

    public verify(req: Request, res: Response) : void {
        res.status(200).json({ message: "User is logged in." });
    }

}

export const userController = new UserController();
