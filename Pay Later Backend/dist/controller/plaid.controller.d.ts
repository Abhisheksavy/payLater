import type { Request, Response } from "express";
export interface AuthRequest extends Request {
    userId?: string;
}
declare class PlaidController {
    classifyRecurring(stream: any): string;
    createLinkToken(req: AuthRequest, res: Response): Promise<Response>;
    exchangePublicToken(req: AuthRequest, res: Response): Promise<Response>;
    accounts(req: AuthRequest, res: Response): Promise<Response>;
    transactions(req: AuthRequest, res: Response): Promise<Response>;
    recurringTransactions(req: AuthRequest, res: Response): Promise<Response>;
}
export declare const plaidController: PlaidController;
export {};
//# sourceMappingURL=plaid.controller.d.ts.map