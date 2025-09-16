import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in env");
}
export function signAccessToken(payload) {
    return jwt.sign(payload, JWT_SECRET);
}
export function verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
}
//# sourceMappingURL=jwt.js.map