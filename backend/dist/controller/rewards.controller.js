import User from "../models/user.model.js";
import { plaidClient } from "../config/plaid.js";
const DEFAULT_CASHBACK_RATE = 0.02;
class RewardController {
    async reward(req, res) {
        try {
            const userId = req.user?._id;
            if (!userId)
                return res.status(401).json({ error: "Unauthorized" });
            const user = await User.findById(userId).lean();
            if (!user?.plaidAccessToken) {
                return res.status(400).json({ error: "No Plaid account linked" });
            }
            const { data } = await plaidClient.transactionsRecurringGet({
                access_token: user.plaidAccessToken,
            });
            const enhance = (stream) => {
                const cashback = +(stream.average_amount.amount * DEFAULT_CASHBACK_RATE).toFixed(2);
                return {
                    ...stream,
                    cashback_rate: DEFAULT_CASHBACK_RATE,
                    cashback_amount: cashback,
                };
            };
            const outflow = (data.outflow_streams || []);
            const inflow = (data.inflow_streams || []);
            const totals = {
                monthly_cashback_estimate: +outflow
                    .filter(s => s.frequency?.toLowerCase() === "monthly")
                    .reduce((sum, s) => sum + (s.cashback_amount || 0), 0)
                    .toFixed(2),
                all_cashback_sum: +outflow
                    .reduce((sum, s) => sum + (s.cashback_amount || 0), 0)
                    .toFixed(2),
            };
            return res.json({
                updated_datetime: data.updated_datetime,
                outflow_streams: outflow,
                inflow_streams: inflow,
                totals,
                request_id: data.request_id,
            });
        }
        catch (err) {
            console.error("getBillsWithRewards error", err);
            return res.status(500).json({ error: "Failed to compute rewards" });
        }
    }
}
export const rewardController = new RewardController();
//# sourceMappingURL=rewards.controller.js.map