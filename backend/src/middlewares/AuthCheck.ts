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
    const token = req.cookies?.token;
    if (token) {
      const decoded = verifyAccessToken<{ id: string }>(token);
      req.userId = decoded.id;
      return next();
    } else if (req.body?.userId) {
      req.userId = req.body.userId;
      return next();
    } else {
      return res.status(404).json({ message: "No token or userId provided" });
    }
  } catch (err) {
    return res.status(400).json({ message: "Token is not valid" });
  }
};
