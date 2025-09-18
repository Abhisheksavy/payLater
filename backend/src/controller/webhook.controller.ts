import type { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/user.model.js";

export interface QuilttWebhookEvent {
  type: string;
  connection?: {
    id: string;
    profileId: string;
    status: string;
    name?: string;
    connector?: {
      name: string;
    };
    accounts?: Array<{
      id: string;
      name: string;
      mask: string;
      type: string;
    }>;
  };
  account?: {
    id: string;
    name: string;
    mask: string;
    type: string;
    connectionId: string;
  };
}

export interface QuilttWebhookPayload {
  eventTypes: string[];
  events: QuilttWebhookEvent[];
}

class WebhookController {

  private verifyQuilttSignature(payload: string, signature: string, timestamp: string): boolean {
    try {
      // Quiltt webhook verification
      // Signature format: version+timestamp+payload
      const version = "v1";
      const signedPayload = `${version}${timestamp}${payload}`;

      // Use QUILTT_API_SECRET as the signing key
      const expectedSignature = crypto
        .createHmac("sha256", process.env.QUILTT_API_SECRET!)
        .update(signedPayload)
        .digest("base64");

      return signature === expectedSignature;
    } catch (error) {
      console.error("Signature verification error:", error);
      return false;
    }
  }

  private isTimestampValid(timestamp: string): boolean {
    const webhookTime = parseInt(timestamp, 10);
    const currentTime = Math.floor(Date.now() / 1000);
    const timeDifference = Math.abs(currentTime - webhookTime);

    // Allow 5 minutes tolerance (300 seconds)
    return timeDifference <= 300;
  }

  public async handleQuilttWebhook(req: Request, res: Response): Promise<Response> {
    try {
      const signature = req.headers["quiltt-signature"] as string;
      const timestamp = req.headers["quiltt-timestamp"] as string;
      const rawBody = JSON.stringify(req.body);

      console.log("Received Quiltt webhook:", {
        signature: signature ? "present" : "missing",
        timestamp,
        eventTypes: req.body.eventTypes,
      });

      // Verify timestamp
      if (!timestamp || !this.isTimestampValid(timestamp)) {
        console.error("Invalid or missing timestamp");
        return res.status(400).json({ error: "Invalid timestamp" });
      }

      // Verify signature
      if (!signature || !this.verifyQuilttSignature(rawBody, signature, timestamp)) {
        console.error("Invalid webhook signature");
        return res.status(401).json({ error: "Invalid signature" });
      }

      const webhookPayload: QuilttWebhookPayload = req.body;

      // Process each event in the webhook
      for (const event of webhookPayload.events) {
        await this.processWebhookEvent(event);
      }

      return res.status(200).json({ received: true });

    } catch (error) {
      console.error("Webhook processing error:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  }

  private async processWebhookEvent(event: QuilttWebhookEvent): Promise<void> {
    console.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case "connection.created":
        await this.handleConnectionCreated(event);
        break;

      case "connection.synced.successful":
        await this.handleConnectionSynced(event);
        break;

      case "connection.synced.failed":
      case "connection.error":
        await this.handleConnectionError(event);
        break;

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
    }
  }

  private async handleConnectionCreated(event: QuilttWebhookEvent): Promise<void> {
    try {
      if (!event.connection) {
        console.error("Missing connection data in webhook event");
        return;
      }

      const { id: connectionId, profileId } = event.connection;

      console.log(`Processing connection.created for profile ${profileId}, connection ${connectionId}`);

      // Find user by quilttPid (profile ID)
      const user = await User.findOne({ quilttPid: profileId });

      if (!user) {
        console.error(`User not found for Quiltt profile: ${profileId}`);
        return;
      }

      // Add connection to user's connections array
      if (!user.quilttConnections) {
        user.quilttConnections = [];
      }

      if (!user.quilttConnections.includes(connectionId)) {
        user.quilttConnections.push(connectionId);
        console.log(`Added connection ${connectionId} to user ${user._id}`);
      }

      // Fetch complete account data from Quiltt to ensure we have latest info
      await this.fetchAndSaveAccountData(user, profileId);

      await user.save();

      console.log(`Successfully processed connection.created webhook for user ${user._id}`);

    } catch (error) {
      console.error("Error handling connection.created webhook:", error);
    }
  }

  private async fetchAndSaveAccountData(user: any, profileId: string): Promise<void> {
    try {
      const query = `
        query GetAccountsForProfile {
          accounts {
            id
            name
            mask
            type
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

      const quilttData = await response.json();

      if (quilttData.data && quilttData.data.accounts) {
        const accounts = quilttData.data.accounts.map((account: any) => ({
          id: account.id,
          name: account.name,
          mask: account.mask,
          type: account.type,
        }));

        user.quilttAccounts = accounts;
        console.log(`Fetched and saved ${accounts.length} accounts for user ${user._id}`);
      }

    } catch (error) {
      console.error("Error fetching account data from Quiltt:", error);
    }
  }

  private async handleConnectionSynced(event: QuilttWebhookEvent): Promise<void> {
    console.log("Connection synced successfully:", event.connection?.id);
    // Could update connection status or refresh account data here
  }

  private async handleConnectionError(event: QuilttWebhookEvent): Promise<void> {
    console.log("Connection error:", event.connection?.id, event.type);
    // Could mark connection as failed or notify user here
  }
}

export const webhookController = new WebhookController();