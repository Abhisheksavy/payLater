import type { Request, Response } from "express";
import { Transaction } from "../models/transactions.model.js";
import User from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";

export interface AuthRequest extends Request {
  userId?: string;
}

class QuilttController {

  public async sessions(req: AuthRequest, res: Response): Promise<Response> {
    const mongoUserId = req.userId;
    const user = await User.findById(mongoUserId);

    try {
      const response = await fetch("https://auth.quiltt.io/v1/users/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.QUILTT_API_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: uuidv4(),
        }),
      });

      const data = await response.json();

      return res.status(response.status).json(data);
    } catch (err) {
      console.error("Session error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  public async transactions(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { profileId } = req.params;
      const userId = req.userId;
      console.log(userId)
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
        return res.status(404).json({ message: "No transactions found" });
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

      return res.json({
        message: "Transactions synced successfully",
        count: transactions.length,
      });
    } catch (err) {
      console.error("Transaction fetch error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  public async accounts(req: AuthRequest, res: Response): Promise<Response> {
    try {
      const { profileId } = req.params;
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

      const data = await response.json();
      return res.json(data);
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }
}

export const quilttController = new QuilttController();
