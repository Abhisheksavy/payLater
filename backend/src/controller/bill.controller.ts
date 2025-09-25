import type { Request, Response } from "express";
import { Transaction } from "../models/transactions.model.js";
import { Bill, type IBill } from "../models/bills.model.js";
import { PendingBill } from "../models/pendingBill.model.js";
import { TransactionHistory } from "../models/transactionHistory.model.js";
import { ObjectId } from 'mongodb';
import { rewardConfig, rewardMultiplier } from "../config/reward.js";
import User from "../models/user.model.js";
import Reward from "../models/rewards.model.js";
import fs from "fs";
import pdf from "pdf-parse-new";
import { put } from "@vercel/blob";

export interface AuthRequest extends Request {
  userId?: string;
}

export class RecurringBillController {
  private recurringKeywords = [
    "rent", "mortgage", "electric", "water", "gas", "internet", "phone", "telecom",
    "netflix", "spotify", "prime", "disney", "hotstar", "gym", "club",
    "insurance", "premium", "policy",
    "loan", "credit card", "emi", "payment",
    "maintenance", "school", "fees", "apple", "itunes", "app store", "google play", "apple music"
  ];

  private detectFrequency = (dates: Date[]): "monthly" | "weekly" | "irregular" => {
    if (dates.length < 2) return "irregular";
    const diffs = [];
    for (let i = 1; i < dates.length; i++) {
      const diff = Math.abs(
        (dates[i]!.getTime() - dates[i - 1]!.getTime()) / (1000 * 60 * 60 * 24)
      );
      diffs.push(diff);
    }
    const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    if (avg > 18 && avg < 35) return "monthly";
    if (avg > 4 && avg <= 9) return "weekly";
    return "irregular";
  };

  public detect = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

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

      const billTypeMap: Record<string, string> = {
        "rent|mortgage": "Rent/Mortgage",
        "electric|water|gas|internet|phone|telecom": "Utilities",
        "netflix|spotify|prime|disney|hotstar|gym|club|itunes|apple|google play|apple music":
          "Subscription",
        "insurance|premium|policy": "Insurance",
        "loan|credit card|emi|payment": "Loan",
        "maintenance|school|fees": "Other Fees",
      };

      function classifyBill(text: string): IBill["billType"] {
        for (const pattern in billTypeMap) {
          const regex = new RegExp(pattern, "i");
          if (regex.test(text)) return billTypeMap[pattern] as IBill["billType"];
        }
        return "Other";
      }


      const bills = results.map((r: any) => {
        const merchant = (r._id.merchant || "").toString();
        const description = (r._id.description || "").toString();
        const frequency = this.detectFrequency(r.dates.map((d: any) => new Date(d)));

        let recurring = false;
        if (r.total >= 2 && ["monthly", "weekly"].includes(frequency)) {
          recurring = true;
        }

        const combinedText = `${merchant} ${description}`;
        const billType = classifyBill(combinedText);

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

      await Bill.deleteMany({ userId });
      const savedBills = await Bill.insertMany(bills);

      return res.json(savedBills);
    } catch (err) {
      console.error("Bill detection error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };


  public getAll = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const bills = await Bill.find({ userId }).sort({ createdAt: -1 });
      return res.json(bills);
    } catch (err) {
      console.error("Fetch bills error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  public getByFrequency = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const { type } = req.params;
      const bills = await Bill.find({ userId, frequency: type }).sort({ createdAt: -1 });
      return res.json(bills);
    } catch (err) {
      console.error("Fetch bills by frequency error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  public getRecurring = async (req: AuthRequest, res: Response) => {
    const bills = await Bill.find({ userId: req.userId, recurring: true }).sort({ createdAt: -1 });
    return res.json(bills);
  };

  public getNonRecurring = async (req: AuthRequest, res: Response) => {
    const bills = await Bill.find({ userId: req.userId, recurring: false }).sort({ createdAt: -1 });
    return res.json(bills);
  };

  private addFrequency(date: Date, frequency: string): Date {
    const newDate = new Date(date);
    switch (frequency) {
      case "weekly":
        newDate.setDate(newDate.getDate() + 7);
        break;
      case "monthly":
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      default:
        newDate.setDate(newDate.getDate() + 30);
    }
    return newDate;
  }

  public getUpcoming = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) return res.status(401).json({ message: "Unauthorized" });

      const bills = await Bill.find({ userId });
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

      return res.json(upcoming);
    } catch (err) {
      console.error("Upcoming bills error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };

  public payBill = async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      const { pendingBillId } = req.body;
      if (!pendingBillId) return res.status(400).json({ message: "pendingBillId is required" });

      const objectId = new ObjectId(pendingBillId);
      const pendingBill = await PendingBill.findOne({ _id: objectId });
      if (!pendingBill) return res.status(404).json({ message: "Pending bill not found" });
      if (pendingBill.status === "paid") {
        return res.status(400).json({ message: "Bill already paid" });
      }

      pendingBill.status = "paid";
      await pendingBill.save();

      const txnHistory = await TransactionHistory.create({
        userId,
        billId: pendingBill._id,
        merchant: pendingBill.merchant,
        description: pendingBill.description,
        amount: pendingBill.nextAmount,
        paidDate: new Date(),
      });

      const bill = await Bill.findById(pendingBill.billId);
      const percentBack = rewardConfig[bill?.billType || "Other"] || 0;
      const rewardBase = Math.abs(pendingBill.nextAmount) * percentBack;
      const rewardPoints = Math.round(rewardBase * rewardMultiplier);
      const cashbackAmount = Math.abs(pendingBill.nextAmount) * 0.01;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            rewardPoints: rewardPoints,
            cashback: cashbackAmount,
          },
        },
        { new: true }
      );

      await Reward.create({
        userId,
        transactionHistoryId: txnHistory._id,
        type: "coins",
        amount: rewardPoints,
        cashback: cashbackAmount,
        description: `Reward for paying ${pendingBill.merchant}`,
      });

      return res.json({
        message: "Bill paid successfully",
        pendingBill,
        transactionHistory: txnHistory,
        rewardEarned: rewardPoints,
        cashbackEarned: cashbackAmount,
        totalPoints: updatedUser?.rewardPoints,
        cashbackBalance: updatedUser?.cashback,
      });
    } catch (err) {
      console.error("Pay pending bill error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  };


  public async verifyBillPayment(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const userId = req.userId;
      console.log(req.body)
      const file = req.file;
      console.log("file", file)
      if (!file) {
        return res.status(400).json({ message: "PDF file is required" });
      }

      // const dataBuffer = fs.readFileSync(file.path); commented for vercel deployment , works in localhost
      // Read the PDF file
      // const dataBuffer = fs.readFileSync(file.path);
      const dataBuffer = file.buffer;

      // // Upload to Vercel Blob
      const { url } = await put(`bills/${file.originalname}`, dataBuffer, {
        access: 'public'
      });

      // // url now contains the public URL of the uploaded PDF
      // console.log("Uploaded PDF URL:", url);

      const pdfData = await pdf(dataBuffer);
      const pdfText = pdfData.text;

      const txnIdMatch = pdfText.match(/Transaction\s*ID[:\s]*(txn_[A-Za-z0-9]+)/i);

      const pdfDateMatch = pdfText.match(/(\d{4}-\d{2}-\d{2})/);

      const pdfAmount = pdfText.match(/Amount:\s*\$([\d,.]+)/i)?.[1] ? Number(pdfText.match(/Amount:\s*\$([\d,.]+)/i)![1].replace(/,/g, "")) : null;

      const user = await User.findById(userId);
      if (!pdfDateMatch) {
        return res.status(400).json({ message: "No date found in PDF" });
      }
      const pdfDate = new Date(pdfDateMatch[1]);

      if (user && pdfDate <= user?.createdAt) {
        return res.status(400).json({
          message: "PDF date must be later than your account creation date"
        });
      }

      let txn = null;

      if (txnIdMatch) {
        const transactionId = txnIdMatch[1];
        txn = await Transaction.findOne({ transactionId, userId });
      }
      else {
        return res.status(404).json({
          message: "Unable to fetch txn history from uploaded pdf",
        });
      }

      if (!txn) {
        return res.status(404).json({
          message: "No matching record found in Linked Bank Account Payment History",
        });
      }

      if (txn.userId !== userId) {
        return res.status(404).json({
          message: "No matching record found in your Linked Bank Account Payment History",
        });
      }

      if (new Date(txn.date).getTime() !== pdfDate.getTime()) {
        return res.status(404).json({
          message: "Dates don't match in uploaded bill & record found in Linked Bank Account Payment History",
        });
      }

      if (txn.merchant !== req.body.company) {
        return res.status(404).json({
          message: "Merchant does not match between uploaded bill & Linked Bank Account Payment History",
        });
      }

      const normalizedTxnAmount = Math.abs(Number(txn.amount));
      const normalizedReqAmount = Math.abs(Number(req.body.amount));
      const normalizedPdfAmount = Math.abs(Number(pdfAmount));

      if (normalizedTxnAmount !== normalizedReqAmount || normalizedTxnAmount !== normalizedPdfAmount) {
        console.log("txn.amount", normalizedTxnAmount);
        console.log("req.body.amount", normalizedReqAmount);
        console.log("pdfAmount", normalizedPdfAmount);
        return res.status(404).json({
          message: "Amount does not match between uploaded bill & Linked Bank Account Payment History",
        });
      }

      const billTypeMap: Record<string, string> = {
        "rent|mortgage": "Rent/Mortgage",
        "electric|water|gas|internet|phone|telecom": "Utilities",
        "netflix|spotify|prime|disney|hotstar|gym|club|itunes|apple|google play|apple music": "Subscription",
        "insurance|premium|policy": "Insurance",
        "loan|credit card|emi|payment": "Loan",
        "maintenance|school|fees": "Other Fees",
      };

      function classifyBill(text: string): string {
        for (const pattern in billTypeMap) {
          const regex = new RegExp(pattern, "i");
          if (regex.test(text)) return billTypeMap[pattern]!;
        }
        return "Other";
      }

      const combinedText = `${txn.merchant || ""} ${txn.description || ""}`;
      const billType = classifyBill(combinedText);

      const relatedBill = await Bill.findOne({ userId, merchant: txn.merchant });

      // console.log("Bill Recurring:", relatedBill?.recurring);

      const percentBack = rewardConfig[relatedBill?.billType || "Other"] || 0;
      const rewardBase = Math.abs(txn.amount) * percentBack;
      const rewardPoints = Math.round(rewardBase * rewardMultiplier);
      const cashbackAmount = Math.abs(txn.amount) * 0.01;

      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          $inc: {
            rewardPoints: rewardPoints,
            cashback: Math.abs(txn.amount) * 0.01,
          },
        },
        { new: true }
      );

      await Reward.create({
        userId,
        transactionHistoryId: txn._id,
        type: "coins",
        amount: rewardPoints,
        cashback: cashbackAmount,
        description: `Reward for paying ${txn.merchant}`,
      });
      await TransactionHistory.create({
        userId,
        billId: txn._id,
        merchant: txn.merchant,
        description: txn.description,
        amount: txn.amount,
        paidDate: new Date(),
      });
      return res.json({
        message: "Bill verified and reward credited",
        billType,
        rewardEarned: rewardPoints,
        totalPoints: updatedUser?.rewardPoints,
        cashbackBalance: updatedUser?.cashback,
        cashbackAmount
      });
    } catch (err) {
      console.error("Verify bill payment error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  // public async verifyBillPayment(req: AuthRequest, res: Response): Promise<Response> {
  //   try {
  //     const userId = req.userId;
  //     const file = req.file;

  //     if (!file) {
  //       return res.status(400).json({ message: "PDF file is required" });
  //     }

  //     // Use buffer directly, no fs.readFileSync
  //     const dataBuffer = file.buffer;

  //     const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  //     if (!blobToken) {
  //       throw new Error("Missing BLOB_READ_WRITE_TOKEN in environment");
  //     }

  //     const uniqueKey = `bills/${Date.now()}-${file.originalname}`;
  //     const { url } = await put(uniqueKey, dataBuffer, {
  //       access: "public",
  //       token: blobToken,

  //     });



  //     console.log("Uploaded PDF URL:", url);

  //     // Read PDF content from buffer
  //     const pdfData = await pdf(dataBuffer);
  //     const pdfText = pdfData.text;

  //     const txnIdMatch = pdfText.match(/Transaction\s*ID[:\s]*(txn_[A-Za-z0-9]+)/i);

  //     let txn = null;
  //     if (txnIdMatch) {
  //       const transactionId = txnIdMatch[1];
  //       txn = await Transaction.findOne({ transactionId, userId });
  //     } else {
  //       return res.status(404).json({
  //         message: "Unable to fetch txn history from uploaded pdf",
  //       });
  //     }

  //     if (!txn) {
  //       return res.status(404).json({
  //         message: "No matching record found in Linked Bank Account Payment History",
  //       });
  //     }

  //     const billTypeMap: Record<string, string> = {
  //       "rent|mortgage": "Rent/Mortgage",
  //       "electric|water|gas|internet|phone|telecom": "Utilities",
  //       "netflix|spotify|prime|disney|hotstar|gym|club|itunes|apple|google play|apple music": "Subscription",
  //       "insurance|premium|policy": "Insurance",
  //       "loan|credit card|emi|payment": "Loan",
  //       "maintenance|school|fees": "Other Fees",
  //     };

  //     function classifyBill(text: string): string {
  //       for (const pattern in billTypeMap) {
  //         const regex = new RegExp(pattern, "i");
  //         if (regex.test(text)) return billTypeMap[pattern]!;
  //       }
  //       return "Other";
  //     }

  //     const combinedText = `${txn.merchant || ""} ${txn.description || ""}`;
  //     const billType = classifyBill(combinedText);

  //     const relatedBill = await Bill.findOne({ userId, merchant: txn.merchant });

  //     const percentBack = rewardConfig[relatedBill?.billType || "Other"] || 0;
  //     const rewardBase = Math.abs(txn.amount) * percentBack;
  //     const rewardPoints = Math.round(rewardBase * rewardMultiplier);
  //     const cashbackAmount = Math.abs(txn.amount) * 0.01;

  //     const updatedUser = await User.findByIdAndUpdate(
  //       userId,
  //       {
  //         $inc: {
  //           rewardPoints,
  //           cashback: cashbackAmount,
  //         },
  //       },
  //       { new: true }
  //     );

  //     await Reward.create({
  //       userId,
  //       transactionHistoryId: txn._id,
  //       type: "coins",
  //       amount: rewardPoints,
  //       cashback: cashbackAmount,
  //       description: `Reward for paying ${txn.merchant}`,
  //     });

  //     await TransactionHistory.create({
  //       userId,
  //       billId: txn._id,
  //       merchant: txn.merchant,
  //       description: txn.description,
  //       amount: txn.amount,
  //       paidDate: new Date(),
  //       fileUrl: url, // save uploaded PDF URL
  //     });

  //     return res.json({
  //       message: "Bill verified and reward credited",
  //       billType,
  //       rewardEarned: rewardPoints,
  //       totalPoints: updatedUser?.rewardPoints,
  //       cashbackBalance: updatedUser?.cashback,
  //       cashbackAmount,
  //       uploadedFileUrl: url
  //     });

  //   } catch (err) {
  //     console.error("Verify bill payment error:", err);
  //     return res.status(500).json({ message: "Server error" });
  //   }
  // }
  // public async verifyBillPayment(req: AuthRequest, res: Response): Promise<Response> {
  //   try {
  //     const userId = req.userId;
  //     const file = req.file;

  //     if (!file) {
  //       return res.status(400).json({ message: "PDF file is required" });
  //     }

  //     // Extract text from PDF
  //     const pdfData = await pdf(file.buffer);
  //     const pdfText = pdfData.text;

  //     // Match "Amount: $120.50" style lines
  //     const amountMatches = [...pdfText.matchAll(/Amount:\s*\$([0-9]+(?:\.[0-9]{2})?)/gi)];

  //     if (!amountMatches.length) {
  //       return res.status(400).json({ message: "No transaction amount found in PDF" });
  //     }

  //     // Convert to numbers
  //     const amounts = amountMatches.map(m => parseFloat(m[1]));

  //     const totalAmount = amounts.reduce((sum, amt) => sum + amt, 0);
  //     const cashbackAmount = totalAmount * 0.01; // 1% cashback
  //     const rewardPoints = amounts.length * 2;   // 2 points per txn

  //     // Update user
  //     const updatedUser = await User.findByIdAndUpdate(
  //       userId,
  //       {
  //         $inc: {
  //           rewardPoints,
  //           cashback: cashbackAmount,
  //         },
  //       },
  //       { new: true }
  //     );

  //     // await Reward.create({
  //     //   userId,
  //     //   type: "coins",
  //     //   amount: rewardPoints,
  //     //   cashback: cashbackAmount,
  //     //   description: `Reward for ${amounts.length} transactions`,
  //     // });

  //     return res.json({
  //       message: "Bill verified and reward credited",
  //       transactions: amounts.length,
  //       totalAmount,
  //       rewardEarned: rewardPoints,
  //       cashbackAmount,
  //       totalPoints: updatedUser?.rewardPoints,
  //       cashbackBalance: updatedUser?.cashback,
  //     });
  //   } catch (err) {
  //     console.error("Verify bill payment error:", err);
  //     return res.status(500).json({ message: "Server error" });
  //   }
  // }

}
