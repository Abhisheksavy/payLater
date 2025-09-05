import type { Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { signAccessToken } from "../utils/jwt.js";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from 'mongodb';
import { PendingBill } from "../models/pendingBill.model.js";
import Reward from "../models/rewards.model.js";

interface AuthRequest extends Request {
    userId?: string;
}

class UserController {

    public async register(req: Request, res: Response): Promise<Response> {
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

    public async verify(req: AuthRequest, res: Response) : Promise<Response> {
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
    } catch (err) {
        return res.status(500).json({ message: "Server error" });
    }
    }

    public async getDashboardSummary(req: AuthRequest, res: Response) : Promise<Response> {
  try {
    const userId = req.userId;
    const mongo_userId = new ObjectId(userId);

    // 1. User info
    const user = await User.findById(mongo_userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. Bills info
    const bills = await PendingBill.find({ userId: mongo_userId });
    const activeBills = bills.filter((b) => b.status === "pending").length;

    // 3. Monthly points (from Reward collection)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyRewards = await Reward.aggregate([
      {
        $match: {
          userId: mongo_userId,
          type: "coins",
          status: "earned",
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: { _id: null, total: { $sum: "$amount" } },
      },
    ]);

    const monthlyPoints = monthlyRewards.length > 0 ? monthlyRewards[0].total : 0;

    // 4. Response
    return res.json({
      totalPoints: user.rewardPoints,
      cashBack: user.cashback,
      activeBills,
      totalBills: bills.length,
      monthlyPoints,
    });
  } catch (err) {
    console.error("Dashboard summary error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
    
}

export const userController = new UserController();
