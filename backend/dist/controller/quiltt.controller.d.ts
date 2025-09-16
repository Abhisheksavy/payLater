import type { Request, Response } from "express";
export interface AuthRequest extends Request {
    userId?: string;
}
declare class QuilttController {
    sessions(req: AuthRequest, res: Response): Promise<Response>;
    transactions(req: AuthRequest, res: Response): Promise<Response>;
    accounts(req: AuthRequest, res: Response): Promise<Response>;
}
export declare const quilttController: QuilttController;
export {};
//# sourceMappingURL=quiltt.controller.d.ts.map