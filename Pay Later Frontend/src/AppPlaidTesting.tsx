import { usePlaidLink } from "react-plaid-link";
import { useState } from "react";
import {
  useQuery,
  useMutation,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import {
  exchangePublicTokenUtil,
  fetchLinkTokenUtil,
  fetchRecurringUtil,
  fetchTransactionsUtil,
} from "./services/plaid";

interface Amount {
  amount: number;
  iso_currency_code: string;
}

interface Stream {
  account_id: string;
  description: string;
  category: string | null;
  average_amount: Amount;
  last_amount: Amount;
  last_date: string;
  frequency: string;
}

interface RecurringResponse {
  inflow_streams: Stream[];
  outflow_streams: Stream[];
  updated_datetime: string;
  request_id: string;
}

const queryClient = new QueryClient();

const PlaidButtonContent = () => {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Fetch Link Token
  const { data: linkToken, isLoading } = useQuery({
    queryKey: ["linkToken"],
    queryFn: fetchLinkTokenUtil,
  });

  const exchangePublicToken = useMutation({
    mutationFn: exchangePublicTokenUtil,
    onSuccess: (data) => {
      setAccessToken(data.access_token);
    },
  });

  const onSuccess = (public_token: string) => {
    exchangePublicToken.mutate(public_token);
  };

  const { data: transactions } = useQuery({
    queryKey: ["transactions", accessToken],
    queryFn: () => fetchTransactionsUtil(accessToken!),
    enabled: !!accessToken,
  });

  const { data: recurring } = useQuery<RecurringResponse>({
    queryKey: ["recurring", accessToken],
    queryFn: () => fetchRecurringUtil(accessToken!),
    enabled: !!accessToken,
  });

  const { open, ready } = usePlaidLink({ token: linkToken?.link_token || "", onSuccess });

  if (isLoading) return <p>Loading...</p>;
  if (!linkToken) return <p>Error fetching link token</p>;

  return (
    <div>
      <button
        onClick={() => open()}
        disabled={!ready}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Link Bank
      </button>

      {transactions?.accounts?.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Connected Accounts : Available Balance</h3>
          <ul className="list-disc ml-6">
            {transactions.accounts.map((tx: any, i: number) => (
              <li key={i}>
                {tx.name} : {tx.balances.available}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Income Section */}
        <section>
          <h2 className="text-xl font-bold mb-3">Recurring Income</h2>
          {recurring?.inflow_streams?.length === 0 ? (
            <p className="text-gray-500">No recurring income found.</p>
          ) : (
            <ul className="space-y-2">
              {recurring?.inflow_streams?.map((s, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl shadow bg-green-50 flex justify-between"
                >
                  <div>
                    <p className="font-semibold">{s.description}</p>
                    <p className="text-sm text-gray-600">
                      Frequency: {s.frequency} | Last Date: {s.last_date}
                    </p>
                  </div>
                  <div className="font-bold text-green-700">
                    {s.average_amount.amount} {s.average_amount.iso_currency_code}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Expenses Section */}
        <section>
          <h2 className="text-xl font-bold mb-3">Recurring Expenses</h2>
          {recurring?.outflow_streams?.length === 0 ? (
            <p className="text-gray-500">No recurring expenses found.</p>
          ) : (
            <ul className="space-y-2">
              {recurring?.outflow_streams?.map((s, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl shadow bg-red-50 flex justify-between"
                >
                  <div>
                    <p className="font-semibold">{s.description}</p>
                    <p className="text-sm text-gray-600">
                      Frequency: {s.frequency} | Last Date: {s.last_date}
                    </p>
                  </div>
                  <div className="font-bold text-red-700">
                    {s.average_amount.amount} {s.average_amount.iso_currency_code}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

const PlaidButton = () => (
    <PlaidButtonContent />
);

export default PlaidButton;
