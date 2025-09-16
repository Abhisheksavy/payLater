import { Transaction } from "../models/transactions.model.js";
import User from "../models/user.model.js";
import { v4 as uuidv4 } from 'uuid';
class QuilttController {
    async sessions(req, res) {
        const mongoUserId = req.userId;
        const user = await User.findById(mongoUserId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        try {
            let body;
            if (user.quilttPid) {
                body = { userId: uuidv4() };
            }
            else {
                body = { email: user.email };
            }
            const response = await fetch("https://auth.quiltt.io/v1/users/sessions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.QUILTT_API_SECRET}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (!user.quilttPid && data.userId && data.userUuid) {
                user.quilttPid = data.userId;
                user.quilttUserUuid = data.userUuid;
                await user.save();
            }
            return res.status(response.status).json(data);
        }
        catch (err) {
            console.error("Session error:", err);
            return res.status(500).json({ message: "Server error" });
        }
    }
    async transactions(req, res) {
        try {
            const { profileId } = req.params;
            const userId = req.userId;
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
            const basicAuth = Buffer.from(`${profileId}:${process.env.QUILTT_API_SECRET}`).toString("base64");
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
            const transactions = data.transactions.edges.map((edge) => ({
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
                await Transaction.findOneAndUpdate({ transactionId: txn.transactionId }, txn, { upsert: true, new: true });
            }
            return res.json({
                message: "Transactions synced successfully",
                count: transactions.length,
            });
        }
        catch (err) {
            console.error("Transaction fetch error:", err);
            return res.status(500).json({ message: "Server error" });
        }
    }
    async accounts(req, res) {
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
            const basicAuth = Buffer.from(`${profileId}:${process.env.QUILTT_API_SECRET}`).toString("base64");
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
        }
        catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
    }
}
export const quilttController = new QuilttController();
//# sourceMappingURL=quiltt.controller.js.map