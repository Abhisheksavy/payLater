import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

export type JwtPayload = { id: string; email: string };

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing in env");
}

export function signAccessToken(
  payload: JwtPayload,
): string {
  return jwt.sign(payload, JWT_SECRET);
}

export function verifyAccessToken<T = JwtPayload>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}
