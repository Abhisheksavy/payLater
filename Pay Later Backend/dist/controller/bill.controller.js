import { Transaction } from "../models/transactions.model.js";
import { Bill } from "../models/bills.model.js";
import { PendingBill } from "../models/pendingBill.model.js";
import { TransactionHistory } from "../models/transactionHistory.model.js";
import { ObjectId } from 'mongodb';
import { rewardConfig, rewardMultiplier } from "../config/reward.js";
import User from "../models/user.model.js";
import Reward from "../models/rewards.model.js";
export class RecurringBillController {
    constructor() {
        this.recurringKeywords = [
            "rent", "mortgage", "electric", "water", "gas", "internet", "phone", "telecom",
            "netflix", "spotify", "prime", "disney", "hotstar", "gym", "club",
            "insurance", "premium", "policy",
            "loan", "credit card", "emi", "payment",
            "maintenance", "school", "fees", "apple", "itunes", "app store", "google play", "apple music"
        ];
        this.detectFrequency = (dates) => {
            if (dates.length < 2)
                return "irregular";
            const diffs = [];
            for (let i = 1; i < dates.length; i++) {
                const diff = Math.abs((dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24));
                diffs.push(diff);
            }
            const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
            if (avg > 25 && avg < 35)
                return "monthly";
            if (avg > 4 && avg <= 9)
                return "weekly";
            if (avg > 9 && avg < 16)
                return "biweekly";
            return "irregular";
        };
        this.detect = async (req, res) => {
            try {
                const userId = req.userId;
                if (!userId)
                    return res.status(401).json({ message: "Unauthorized" });
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
                const results = await Transaction.aggregate(pipeline);
                const billTypeMap = {
                    "rent|mortgage": "Rent/Mortgage",
                    "electric|water|gas|internet|phone|telecom": "Utilities",
                    "netflix|spotify|prime|disney|hotstar|gym|club|itunes|apple|google play|apple music": "Subscription",
                    "insurance|premium|policy": "Insurance",
                    "loan|credit card|emi|payment": "Loan",
                    "maintenance|school|fees": "Other Fees",
                };
                function classifyBill(text) {
                    for (const pattern in billTypeMap) {
                        const regex = new RegExp(pattern, "i");
                        if (regex.test(text))
                            return billTypeMap[pattern];
                    }
                    return "Other";
                }
                const bills = results.map((r) => {
                    const merchant = (r._id.merchant || "").toString();
                    const description = (r._id.description || "").toString();
                    const frequency = this.detectFrequency(r.dates.map((d) => new Date(d)));
                    let recurring = false;
                    if (r.total >= 2 && ["monthly", "weekly", "biweekly"].includes(frequency)) {
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
            }
            catch (err) {
                console.error("Bill detection error:", err);
                return res.status(500).json({ message: "Server error" });
            }
        };
        this.getAll = async (req, res) => {
            try {
                const userId = req.userId;
                if (!userId)
                    return res.status(401).json({ message: "Unauthorized" });
                const bills = await Bill.find({ userId }).sort({ createdAt: -1 });
                return res.json(bills);
            }
            catch (err) {
                console.error("Fetch bills error:", err);
                return res.status(500).json({ message: "Server error" });
            }
        };
        this.getByFrequency = async (req, res) => {
            try {
                const userId = req.userId;
                if (!userId)
                    return res.status(401).json({ message: "Unauthorized" });
                const { type } = req.params;
                const bills = await Bill.find({ userId, frequency: type }).sort({ createdAt: -1 });
                return res.json(bills);
            }
            catch (err) {
                console.error("Fetch bills by frequency error:", err);
                return res.status(500).json({ message: "Server error" });
            }
        };
        this.getRecurring = async (req, res) => {
            const bills = await Bill.find({ userId: req.userId, recurring: true }).sort({ createdAt: -1 });
            return res.json(bills);
        };
        this.getNonRecurring = async (req, res) => {
            const bills = await Bill.find({ userId: req.userId, recurring: false }).sort({ createdAt: -1 });
            return res.json(bills);
        };
        this.getUpcoming = async (req, res) => {
            try {
                const userId = req.userId;
                if (!userId)
                    return res.status(401).json({ message: "Unauthorized" });
                const bills = await Bill.find({ userId });
                await PendingBill.deleteMany({ userId });
                const upcoming = await Promise.all(bills.map(async (bill) => {
                    const latestTxn = await Transaction.findOne({
                        userId,
                        merchant: bill.merchant,
                        description: bill.description,
                        amount: { $lt: 0 }
                    }).sort({ date: -1 });
                    const lastDate = latestTxn?.date ?? bill.createdAt;
                    const nextDate = this.addFrequency(lastDate, bill.frequency ?? "irregular");
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
                }));
                return res.json(upcoming);
            }
            catch (err) {
                console.error("Upcoming bills error:", err);
                return res.status(500).json({ message: "Server error" });
            }
        };
        this.payBill = async (req, res) => {
            try {
                const userId = req.userId;
                const { pendingBillId } = req.body;
                if (!pendingBillId)
                    return res.status(400).json({ message: "pendingBillId is required" });
                const objectId = new ObjectId(pendingBillId);
                const pendingBill = await PendingBill.findOne({ _id: objectId });
                if (!pendingBill)
                    return res.status(404).json({ message: "Pending bill not found" });
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
                const updatedUser = await User.findByIdAndUpdate(userId, {
                    $inc: {
                        rewardPoints: rewardPoints,
                        cashback: cashbackAmount,
                    },
                }, { new: true });
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
            }
            catch (err) {
                console.error("Pay pending bill error:", err);
                return res.status(500).json({ message: "Server error" });
            }
        };
    }
    addFrequency(date, frequency) {
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
}
//# sourceMappingURL=bill.controller.js.map