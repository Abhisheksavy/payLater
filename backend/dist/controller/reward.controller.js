class RewardController {
    async reward(req, res) {
        try {
            return res.json({ message: "reward endpoint" });
        }
        catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
    }
}
export const rewardController = new RewardController();
//# sourceMappingURL=reward.controller.js.map