import { verifyAccessToken } from "../utils/jwt.js";
export const authCheck = (req, res, next) => {
    try {
        const token = req.cookies?.token;
        console.log(req.cookies);
        if (!token)
            return res.status(400).json({ message: "No token, authorization denied" });
        const decoded = verifyAccessToken(token);
        req.userId = decoded.id;
        next();
    }
    catch (err) {
        return res.status(400).json({ message: "Token is not valid" });
    }
};
//# sourceMappingURL=AuthCheck.js.map