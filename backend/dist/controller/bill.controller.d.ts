import type { Request, Response } from "express";
export interface AuthRequest extends Request {
    userId?: string;
}
export declare class RecurringBillController {
    private recurringKeywords;
    private detectFrequency;
    detect: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    getAll: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    getByFrequency: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    getRecurring: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    getNonRecurring: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    private addFrequency;
    getUpcoming: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    payBill: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    verifyBillPayment(req: AuthRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=bill.controller.d.ts.map