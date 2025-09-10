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
    const response = await api.post("/quiltt/sessions");
    console.log("Full response from /quiltt/sessions:", response);
    console.log("Extracted data:", response.data);
    return response.data;
  },
  retry: 1
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

  const billsQuery = useQuery({
    queryKey: ["bills"],
    queryFn: async () => {
      const { data } = await api.get(`/bill`);
      console.log("bills", data);
      return data;
    },
    enabled: !!profileId,
  });

  const detectBills = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/bill/detect`);
      console.log(data)
      return data;
    },
    onSuccess: () => {
      billsQuery.refetch();
    },
  });
  
  if (isLoading) return <p>Loading Quiltt...</p>;
  if (error) return <p>Failed to initialize Quiltt session</p>;
  if (!session?.token) return <p>No session token available</p>;

  return (
    <QuilttProvider token={session.token}>
      {children}
      <br />
    </QuilttProvider>
  );
}
