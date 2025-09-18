import type { Request, Response } from "express";
import crypto from "crypto";
import { Transaction } from "../models/transactions.model.js";
import User from "../models/user.model.js";
import { v4 as uuidv4 } from "uuid";

export interface AuthRequest extends Request {
  userId?: string;
}

// Helper function to generate consistent UUID from MongoDB ID
function generateConsistentUUID(mongoId: string): string {
  // Generate a consistent UUID based on MongoDB ID
  // This ensures the same MongoDB ID always generates the same UUID
  const hash = crypto.createHash("sha256").update(mongoId).digest("hex");

  // Format as UUID v4 style
  const uuid = [
    hash.substring(0, 8),
    hash.substring(8, 12),
    "4" + hash.substring(13, 16), // Version 4
    ((parseInt(hash.substring(16, 17), 16) & 0x3) | 0x8).toString(16) +
      hash.substring(17, 20),
    hash.substring(20, 32),
  ].join("-");

  return uuid;
}

class QuilttController {
  public async sessions(req: AuthRequest, res: Response): Promise<Response> {
    const mongoUserId = req.userId;
    console.log(mongoUserId)
    const user = await User.findById(mongoUserId);
    console.log(user)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      let quilttUserId: string;

      // Check if user already has a Quiltt external ID
      if (user.quilttPid) {
        quilttUserId = user.quilttPid;
      } else {
        // Generate a consistent UUID-based ID for Quiltt using MongoDB ID
        // This ensures the same user always gets the same Quiltt ID
        quilttUserId = uuidv4();
        user.quilttExternalId = quilttUserId;
        await user.save();
      }

      const body: Record<string, string> = {
        userId: quilttUserId,
      };

      console.log(
        "Creating Quiltt session for user:",
        mongoUserId,
        "with Quiltt userId:",
        quilttUserId
      );
      const response = await fetch("https://auth.quiltt.io/v1/users/sessions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.QUILTT_API_SECRET}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Quiltt session creation failed:", data);
        return res.status(response.status).json(data);
      }

      // Update user with Quiltt profile info if not already set
      if (data.userId && data.userUuid) {
        let needsUpdate = false;

        if (!user.quilttPid || user.quilttPid !== data.userId) {
          user.quilttPid = data.userId;
          needsUpdate = true;
        }

        if (!user.quilttUserUuid || user.quilttUserUuid !== data.userUuid) {
          user.quilttUserUuid = data.userUuid;
          needsUpdate = true;
        }

        if (needsUpdate) {
          await user.save();
        }
      }

      return res.status(response.status).json(data);
    } catch (err) {
      console.error("Session error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  public async transactions(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
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

  // Note: Manual connection saving has been removed
  // Connections are now saved automatically via Quiltt webhooks

  public async getUserConnections(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const userId = req.userId;
      const user = await User.findById(userId);

      if (!user || !user.quilttPid) {
        return res
          .status(404)
          .json({ message: "User or Quiltt profile not found" });
      }

      // Fetch user's connections and accounts from Quiltt
      const query = `
        query GetUserData {
          connections {
            id
            status
          }
          accounts {
            id
            name
            mask
            kind
            balance {
              available
              current
            }
            connection {
              id
            }
          }
        }
      `;

      const basicAuth = Buffer.from(
        `${user.quilttPid}:${process.env.QUILTT_API_SECRET}`
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
      console.log("==============>", data);

      // Log all connection statuses for debugging
      if (data.data?.connections) {
        console.log("All connections with statuses:",
          data.data.connections.map((conn: any) => ({ id: conn.id, status: conn.status }))
        );
      }

      if (!data.data) {
        return res
          .status(500)
          .json({ message: "Failed to fetch user data from Quiltt" });
      }

      // Filter to only include active connections (CONNECTED, SYNCING, or SYNCED)
      const activeConnections = (data.data.connections || []).filter(
        (conn: any) => ['CONNECTED', 'SYNCING', 'SYNCED'].includes(conn.status)
      );

      console.log("Filtered active connections:", activeConnections.length);

      return res.status(200).json({
        connections: activeConnections,
        accounts: data.data.accounts || [],
        profileId: user.quilttPid,
      });
    } catch (err) {
      console.error("Get user connections error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }

  public async disconnectConnection(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { connectionId } = req.params;
      const userId = req.userId;

      const user = await User.findById(userId);
      if (!user || !user.quilttPid) {
        return res
          .status(404)
          .json({ message: "User or Quiltt profile not found" });
      }

      const mutation = `
        mutation ConnectionDisconnect($input: ConnectionDisconnectInput!) {
          connectionDisconnect(input: $input) {
            success
            errors {
              message
            }
            record {
              id
              status
            }
          }
        }
      `;

      const variables = {
        input: {
          id: connectionId,
        },
      };

      const basicAuth = Buffer.from(
        `${user.quilttPid}:${process.env.QUILTT_API_SECRET}`
      ).toString("base64");

      const response = await fetch("https://api.quiltt.io/v1/graphql", {
        method: "POST",
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: mutation, variables }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Connection disconnect failed:", data);
        return res.status(response.status).json(data);
      }

      if (data.data?.connectionDisconnect?.errors?.length > 0) {
        return res.status(400).json({
          message: "Failed to disconnect connection",
          errors: data.data.connectionDisconnect.errors,
        });
      }

      if (!data.data?.connectionDisconnect?.success) {
        return res.status(400).json({
          message: "Failed to disconnect connection",
        });
      }

      return res.json({
        message: "Connection disconnected successfully",
        connectionId,
        status: data.data.connectionDisconnect.record?.status,
      });
    } catch (err) {
      console.error("Connection disconnect error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

export const quilttController = new QuilttController();
