import type { Request, Response } from "express";
interface AuthRequest extends Request {
    userId?: string;
}
declare class UserController {
    register(req: Request, res: Response): Promise<Response>;
    login(req: Request, res: Response): Promise<Response>;
    logout(req: Request, res: Response): Promise<void>;
    verify(req: AuthRequest, res: Response): Promise<Response>;
}
export declare const userController: UserController;
export {};
//# sourceMappingURL=user.controller.d.ts.map