// src/services/plaid.ts
import api from "@/lib/axios";

export async function exchangePublicTokenUtil(public_token: string) {
  const { data } = await api.post("/plaid/exchange_public_token", {
    public_token,
  });
  return data;
}

export async function fetchLinkTokenUtil() {
  const { data } = await api.post("/plaid/create_link_token");
  return data;
}

export async function fetchTransactionsUtil(accessToken: string) {
  const { data } = await api.get(`/plaid/transactions`, {
    params: { token: accessToken },
  });
  return data;
}

export async function fetchRecurringUtil(accessToken: string) {
  const { data } = await api.get(`/plaid/recurring_transactions`, {
    params: { token: accessToken },
  });
  return data;
}
