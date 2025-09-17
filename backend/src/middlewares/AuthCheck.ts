import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  userId?: string;
}

export const authCheck = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(400).json({ message: "No token, authorization denied" });

    const decoded = verifyAccessToken<{ id: string }>(token);
    req.userId = decoded.id;

    next();
  } catch (err) {
    return res.status(400).json({ message: "Token is not valid" });
  }
};
