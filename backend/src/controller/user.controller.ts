import type { Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { signAccessToken } from "../utils/jwt.js";
import { v4 as uuidv4 } from "uuid";
import { ObjectId } from 'mongodb';
import { PendingBill } from "../models/pendingBill.model.js";
import Reward from "../models/rewards.model.js";
import { Transaction } from "../models/transactions.model.js";

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

      const user = await User.create({ name, email, password: hashedPassword });

      const token = signAccessToken({ id: user._id.toString(), email: user.email });

      const isProd = process.env.NODE_ENV === "production";

      res.cookie("token", token, {
        httpOnly: true,                       
        secure: isProd,                       
        sameSite: isProd ? "none" : "lax",    
        maxAge: 24 * 60 * 60 * 1000,          
      });

      return res.json({ id: user._id, name, email, createdAt: user.createdAt });
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

      const isProd = process.env.NODE_ENV === "production";

      res.cookie("token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
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

  public async verify(req: AuthRequest, res: Response): Promise<Response> {
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

  public async getDashboardSummary(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      const mongo_userId = new ObjectId(userId);

      const user = await User.findById(mongo_userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      const bills = await PendingBill.find({ userId: mongo_userId });
      const activeBills = bills.filter((b) => b.status === "pending").length;

      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const monthlyRewards = await Reward.aggregate([
        {
          $match: {
            userId: mongo_userId,
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: { _id: null, total: { $sum: "$amount" } },
        },
      ]);

      const monthlyPoints = monthlyRewards.length > 0 ? monthlyRewards[0].total : 0;

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
  }

  private async syncTransactions(userId: string, profileId: string) {
    const query = `
    query Transactions {
      transactions {
        edges {
          node {
            id
            date
            amount
            description
            status
            merchant {
              name
            }
            account {
              id
              name
            }
          }
        }
      }
    }
  `;

    const basicAuth = Buffer.from(
      `${profileId}:${process.env.QUILTT_API_SECRET}`
    ).toString("base64");

    const response = await fetch("https://api.quiltt.io/v1/graphql", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();

    if (!data || !data.transactions) {
      return { message: "No transactions found", count: 0 };
    }

    const transactions = data.transactions.edges.map((edge: any) => ({
      transactionId: edge.node.id,
      userId,
      date: edge.node.date,
      amount: edge.node.amount,
      description: edge.node.description,
      status: edge.node.status,
      merchant: edge.node.merchant?.name || null,
      accountId: edge.node.account.id,
      accountName: edge.node.account.name,
    }));

    for (const txn of transactions) {
      await Transaction.findOneAndUpdate(
        { transactionId: txn.transactionId },
        txn,
        { upsert: true, new: true }
      );
    }

    return { message: "Transactions synced", count: transactions.length };
  }

  private async syncAccounts(profileId: string) {
    const query = `
    query Accounts {
      accounts {
        id
        name
        mask
        type
        balance {
          available
          current
        }
      }
    }
  `;

    const basicAuth = Buffer.from(
      `${profileId}:${process.env.QUILTT_API_SECRET}`
    ).toString("base64");

    const response = await fetch("https://api.quiltt.io/v1/graphql", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    const { data } = await response.json();

    if (!data || !data.accounts) {
      return { message: "No accounts found", count: 0 };
    }

    // (Optional) save accounts in DB
    // for (const acc of data.accounts) {
    //   await Account.findOneAndUpdate(
    //     { accountId: acc.id },
    //     { ...acc, profileId },
    //     { upsert: true, new: true }
    //   );
    // }

    return { message: "Accounts synced", count: data.accounts.length, accounts: data.accounts };
  }

  public async updateConnectionDetails(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { profileId, connectionId } = req.body;
      const mongoUserId = req.userId;

      if (!profileId) {
        return res.status(400).json({ message: "profileId is required" });
      }

      const user = await User.findById(mongoUserId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.quilttPid = profileId;

      if (connectionId) {
        if (!user.quilttConnections) user.quilttConnections = [];
        if (!user.quilttConnections.includes(connectionId)) {
          user.quilttConnections.push(connectionId);
        }
      }

      await user.save();

      const transactionsResult = await this.syncTransactions(mongoUserId!, profileId);
      const accountsResult = await this.syncAccounts(profileId);

      return res.json({
        message: "Connection details updated successfully",
        quilttPid: user.quilttPid,
        quilttConnections: user.quilttConnections,
        transactions: transactionsResult,
        accounts: accountsResult,
      });
    } catch (err) {
      console.error("updateConnectionDetails error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }


}

export const userController = new UserController();
