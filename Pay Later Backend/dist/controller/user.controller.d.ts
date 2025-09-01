import type { Request, Response } from "express";
declare class UserController {
    register(req: Request, res: Response): Promise<Response>;
    login(req: Request, res: Response): Promise<Response>;
    logout(req: Request, res: Response): Promise<void>;
    verify(req: Request, res: Response): void;
}
export declare const userController: UserController;
export {};
//# sourceMappingURL=user.controller.d.ts.map