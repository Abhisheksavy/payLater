import type { Request, Response } from "express";

class RewardController {

    public async reward(req: Request, res: Response): Promise<Response> {
        try {
            return res.json({ message: "reward endpoint"});
        } catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
    }
}

export const rewardController = new RewardController();
