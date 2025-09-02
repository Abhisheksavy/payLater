import { useState } from "react";
import { QuilttProvider } from "@quiltt/react";
import { useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import api from "./lib/axios";

export default function QuilttProviderGate({ children }: { children: React.ReactNode }) {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const location = useLocation();

  useQuery({
    queryKey: ["parseUrlParams", location.search],
    queryFn: async () => {
      const params = new URLSearchParams(location.search);
      const urlProfileId = params.get("profileId");
      const urlConnectionId = params.get("connectionId");
      if (urlProfileId) {
        console.log("Parsed from URL:", { profileId: urlProfileId, connectionId: urlConnectionId });
        setProfileId(urlProfileId);
        setConnectionId(urlConnectionId);
      }
      return { urlProfileId, urlConnectionId };
    },
  });

  const { data: session, error, isLoading } = useQuery({
    queryKey: ["quilttSession"],
    queryFn: async () => {
      const { data } = await api.post("/quiltt/sessions");
      console.log("Session token fetched:", data.token);
      return data;
    },
  });

  const transactionsQuery = useQuery({
    queryKey: ["transactions", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data } = await api.get(`/quiltt/transactions/${profileId}`);
      return data;
    },
    enabled: !!profileId,
  });

  const accountsQuery = useQuery({
    queryKey: ["accounts", profileId],
    queryFn: async () => {
      if (!profileId) return [];
      const { data } = await api.get(`/quiltt/accounts/${profileId}`);
      return data;
    },
    enabled: !!profileId,
  });

  if (isLoading) return <p>Loading Quiltt...</p>;
  if (error) return <p>Failed to initialize Quiltt session</p>;
  if (!session?.token) return <p>No session token available</p>;

  return (
    <QuilttProvider token={session.token}>
      {children}
      <br />
      {profileId && (
        <div>
          <p>Connected Profile ID: {profileId}</p>
          <p>Connection ID: {connectionId || "N/A"}</p>

          <button onClick={() => transactionsQuery.refetch()}>
            {transactionsQuery.isFetching ? "Fetching Transactions..." : "Fetch Transactions"}
          </button>
          {transactionsQuery.data && (
            <pre>{JSON.stringify(transactionsQuery.data, null, 2)}</pre>
          )}

          <br />

          <button onClick={() => accountsQuery.refetch()}>
            {accountsQuery.isFetching ? "Fetching Accounts..." : "Fetch Accounts"}
          </button>
          {accountsQuery.data && (
            <pre>{JSON.stringify(accountsQuery.data, null, 2)}</pre>
          )}
        </div>
      )}
    </QuilttProvider>
  );
}
