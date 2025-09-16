import type { Request, Response, NextFunction } from "express";
export interface AuthRequest extends Request {
    userId?: string;
}
export declare const authCheck: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=AuthCheck.d.ts.map