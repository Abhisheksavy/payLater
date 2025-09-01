
export type CashbackRuleKey =
  | "Rent"
  | "Utilities"
  | "Subscriptions"
  | "Insurance"
  | "Telecom"
  | "Education"
  | "Other";

export const REWARDS_RULES: Record<CashbackRuleKey, number> = {
  Rent: 0.01,          // 1%
  Utilities: 0.02,     // 2%
  Subscriptions: 0.05, // 5%
  Insurance: 0.015,    // 1.5%
  Telecom: 0.02,       // 2%
  Education: 0.01,     // 1%
  Other: 0.005,        // 0.5%
};
