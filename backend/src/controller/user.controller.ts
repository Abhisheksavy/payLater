import type { Request, Response } from "express";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { signAccessToken } from "../utils/jwt.js";
import { ObjectId } from 'mongodb';
import { PendingBill } from "../models/pendingBill.model.js";
import Reward from "../models/rewards.model.js";
import { Transaction } from "../models/transactions.model.js";
import { Bill, type IBill } from "../models/bills.model.js";

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

  public async getUserAccounts(req: AuthRequest, res: Response): Promise<Response> {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(req.userId);
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Map accounts to only return id + name
    const accounts = (user.quilttAccounts || []).map(acc => ({
      id: acc.id,
      name: acc.name,
    }));

    return res.status(200).json({
      accounts,
    });
  } catch (err) {
    console.error("Error fetching user accounts:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

  // Helper methods for bill detection (moved from bill controller)
  private detectFrequency = (dates: Date[]): "monthly" | "weekly" | "biweekly" | "irregular" => {
    if (dates.length < 2) return "irregular";
    const diffs = [];
    for (let i = 1; i < dates.length; i++) {
      const diff = Math.abs(
        (dates[i]!.getTime() - dates[i - 1]!.getTime()) / (1000 * 60 * 60 * 24)
      );
      diffs.push(diff);
    }
    const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    if (avg > 25 && avg < 35) return "monthly";
    if (avg > 4 && avg <= 9) return "weekly";
    if (avg > 9 && avg < 16) return "biweekly";
    return "irregular";
  };

  private classifyBill(text: string): IBill["billType"] {
    const billTypeMap: Record<string, string> = {
      "rent|mortgage": "Rent/Mortgage",
      "electric|water|gas|internet|phone|telecom": "Utilities",
      "netflix|spotify|prime|disney|hotstar|gym|club|itunes|apple|google play|apple music": "Subscription",
      "insurance|premium|policy": "Insurance",
      "loan|credit card|emi|payment": "Loan",
      "maintenance|school|fees": "Other Fees",
    };

    for (const pattern in billTypeMap) {
      const regex = new RegExp(pattern, "i");
      if (regex.test(text)) return billTypeMap[pattern] as IBill["billType"];
    }
    return "Other";
  }

  private addFrequency(date: Date, frequency: string): Date {
    const newDate = new Date(date);
    switch (frequency) {
      case "weekly":
        newDate.setDate(newDate.getDate() + 7);
        break;
      case "biweekly":
        newDate.setDate(newDate.getDate() + 14);
        break;
      case "monthly":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      default:
        newDate.setDate(newDate.getDate() + 30);
    }
    return newDate;
  }

  // Bill detection logic
  private async detectBills(userId: string) {
    try {
      const pipeline = [
        { $match: { userId, amount: { $lt: 0 } } },
        {
          $group: {
            _id: { merchant: "$merchant", description: "$description" },
            total: { $sum: 1 },
            avgAmount: { $avg: "$amount" },
            dates: { $push: "$date" }
          }
        }
      ];

      const results: any[] = await Transaction.aggregate(pipeline);

      const bills = results.map((r: any) => {
        const merchant = (r._id.merchant || "").toString();
        const description = (r._id.description || "").toString();
        const frequency = this.detectFrequency(r.dates.map((d: any) => new Date(d)));

        let recurring = false;
        if (r.total >= 2 && ["monthly", "weekly", "biweekly"].includes(frequency)) {
          recurring = true;
        }

        const combinedText = `${merchant} ${description}`;
        const billType = this.classifyBill(combinedText);

        return {
          userId,
          merchant: merchant || "Unknown",
          description: description || "No description",
          avgAmount: r.avgAmount,
          frequency,
          totalOccurrences: r.total,
          recurring,
          verified: false,
          billType,
        };
      });

      // Delete existing bills and insert new ones
      await Bill.deleteMany({ userId });
      const savedBills = await Bill.insertMany(bills);
      return savedBills;
    } catch (err) {
      console.error("Bill detection error:", err);
      return [];
    }
  }

  // Generate upcoming bills logic
  private async generateUpcomingBills(userId: string) {
    try {
      const bills = await Bill.find({ userId });
      
      // Clear existing pending bills
      await PendingBill.deleteMany({ userId });

      const upcoming = await Promise.all(
        bills.map(async (bill) => {
          const latestTxn = await Transaction.findOne({
            userId,
            merchant: bill.merchant,
            description: bill.description,
            amount: { $lt: 0 }
          }).sort({ date: -1 });

          const lastDate = latestTxn?.date ?? bill.createdAt;
          const nextDate = this.addFrequency(
            lastDate,
            bill.frequency ?? "irregular"
          );

          const nextAmount = latestTxn?.amount ?? bill.avgAmount;

          return PendingBill.create({
            userId,
            billId: bill._id,
            merchant: bill.merchant,
            description: bill.description,
            nextAmount,
            lastPaidDate: lastDate,
            nextPaymentDate: nextDate,
            status: "pending"
          });
        })
      );

      return upcoming;
    } catch (err) {
      console.error("Generate upcoming bills error:", err);
      return [];
    }
  }

  // ... existing syncTransactions and syncAccounts methods remain the same ...

  updateConnectionDetails = async (req: AuthRequest, res: Response) => {
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

      // Sync transactions and accounts
      const transactionsResult = await this.syncTransactions(mongoUserId!, profileId);
      const accountsResult = await this.syncAccounts(profileId);
      const filteredAccounts = accountsResult.accounts?.map((acc: any) => ({
        id: acc.id,
        name: acc.name,
      })) || [];

      user.quilttAccounts = filteredAccounts;
      await user.save();

      // Detect bills from synced transactions
      const detectedBills = await this.detectBills(mongoUserId!);
      
      // Generate upcoming bills based on detected bills
      const upcomingBills = await this.generateUpcomingBills(mongoUserId!);

      return res.json({
        message: "Connection details updated successfully",
        quilttPid: user.quilttPid,
        quilttConnections: user.quilttConnections,
        quilttAccounts: user.quilttAccounts,
        transactions: transactionsResult,
        accounts: accountsResult,
        billsDetected: {
          count: detectedBills.length,
          bills: detectedBills
        },
        upcomingBills: {
          count: upcomingBills.length,
          bills: upcomingBills
        }
      });
    } catch (err) {
      console.error("updateConnectionDetails error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };
}

export const userController = new UserController();
