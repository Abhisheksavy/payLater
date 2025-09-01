import { plaidClient } from '../config/plaid.js';
import { CountryCode, Products } from "plaid";
import User from "../models/user.model.js";
import { encrypt } from "../utils/crypto.js";
class PlaidController {
    classifyRecurring(stream) {
        const desc = (stream.merchant_name || stream.description || "").toLowerCase();
        if (/rent|mortgage|landlord/.test(desc))
            return "Rent/Mortgage";
        if (/electric|power|water|gas|internet|fiber|mobile|phone|telecom/.test(desc))
            return "Utilities";
        if (/netflix|spotify|amazon|prime|hbo|max|apple music|gym|fitness|membership/.test(desc))
            return "Subscription";
        if (/insurance|insur|premium/.test(desc))
            return "Insurance";
        if (/loan|emi|credit card|auto loan|student loan/.test(desc))
            return "Loan Payment";
        if (/maintenance|hoa|school|college|fees|education/.test(desc))
            return "Other Fees";
        switch (stream.personal_finance_category?.primary) {
            case "UTILITIES": return "Utilities";
            case "LOAN_PAYMENTS": return "Loan Payment";
            case "INSURANCE": return "Insurance";
        }
        return "Uncategorized";
    }
    async createLinkToken(req, res) {
        try {
            const response = await plaidClient.linkTokenCreate({
                user: { client_user_id: req.userId },
                client_name: 'My App',
                products: [Products.Auth, Products.Transactions],
                language: 'en',
                country_codes: [CountryCode.Us]
            });
            return res.status(200).json(response.data);
        }
        catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
    }
    async exchangePublicToken(req, res) {
        try {
            const { public_token } = req.body;
            const userId = req.userId;
            const response = await plaidClient.itemPublicTokenExchange({ public_token });
            const access_token = response.data.access_token;
            const encryptedToken = encrypt(access_token);
            await User.findByIdAndUpdate(userId, { plaidAccessToken: encryptedToken });
            return res.json({ access_token });
        }
        catch (err) {
            console.log("err", err);
            return res.status(500).json({ message: "Server error" });
        }
    }
    async accounts(req, res) {
        try {
            const response = await plaidClient.accountsGet({ access_token: req.query.token });
            return res.json(response.data);
        }
        catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
    }
    async transactions(req, res) {
        try {
            const response = await plaidClient.transactionsGet({
                access_token: req.query.token,
                start_date: '2023-01-01',
                end_date: '2023-12-31',
            });
            return res.json(response.data);
        }
        catch (err) {
            return res.status(500).json({ message: "Server error" });
        }
    }
    // public async recurringTransactions(req: AuthRequest, res: Response): Promise<Response> {
    //     try {
    //         const accessToken = req.query.token as string;
    //         const response = await plaidClient.transactionsRecurringGet({ access_token: accessToken });
    //         return res.json(response.data);
    //     } catch (err) {
    //         return res.status(500).json({ message: "Error fetching recurring transactions" });
    //     }
    // }
    async recurringTransactions(req, res) {
        try {
            const accessToken = req.query.token;
            const response = await plaidClient.transactionsRecurringGet({ access_token: accessToken });
            const inflow_streams = response.data.inflow_streams.map((s) => ({
                ...s,
                classification: this.classifyRecurring(s),
            }));
            const outflow_streams = response.data.outflow_streams.map((s) => ({
                ...s,
                classification: this.classifyRecurring(s),
            }));
            return res.json({
                ...response.data,
                inflow_streams,
                outflow_streams,
            });
        }
        catch (err) {
            console.log("error ", err);
            return res.status(500).json({ message: "Error fetching recurring transactions" });
        }
    }
}
export const plaidController = new PlaidController();
//# sourceMappingURL=plaid.controller.js.map