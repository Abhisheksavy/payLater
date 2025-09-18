import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authCheck = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Try to get token from Authorization header first, then fallback to cookies
    let token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.substring(7)
      : req.cookies?.token;

    console.log("=== AuthCheck Debug ===");
    console.log("Authorization header:", req.headers.authorization);
    console.log("Cookies received:", req.cookies);
    console.log("Token extracted:", token ? "***TOKEN_PRESENT***" : "NO_TOKEN");
    console.log("req.body?.userId", req.body?.userId);

    if (!token) {
      console.log("No token found in Authorization header or cookies");
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = verifyAccessToken<{ id: string }>(token);
    console.log("Decoded token:", decoded);
    req.userId = decoded.id || req.body?.userId;
    console.log("Set req.userId to:", req.userId);

    next();
  } catch (err) {
    console.log("Token verification error:", err);
    return res.status(400).json({ message: "Token is not valid" });
  }
};
