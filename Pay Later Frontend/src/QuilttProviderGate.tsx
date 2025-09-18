import { useState, useEffect, createContext, useContext } from "react";
import { QuilttProvider } from "@quiltt/react";
import { useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import api from "./lib/axios";

// Create context for session refresh
const QuilttSessionContext = createContext<{
  refreshSession: () => void;
} | null>(null);

export const useQuilttSession = () => {
  const context = useContext(QuilttSessionContext);
  if (!context) {
    throw new Error("useQuilttSession must be used within QuilttProviderGate");
  }
  return context;
};

export default function QuilttProviderGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [profileId, setProfileId] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null);
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Make session key per-user to avoid cross-user session conflicts
  const SESSION_KEY = user
    ? `quilttSession_${user.id}`
    : "quilttSession_anonymous";
  const SESSION_TTL = 1000 * 60 * 50;

  // Clean up old session cache when user changes or logs out
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear all Quiltt session cache when user logs out
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("quilttSession_")) {
          localStorage.removeItem(key);
        }
      });
    }
  }, [isAuthenticated]);

  useQuery({
    queryKey: ["parseUrlParams", location.search],
    queryFn: async () => {
      const params = new URLSearchParams(location.search);
      const urlProfileId = params.get("profileId");
      const urlConnectionId = params.get("connectionId");

      if (urlProfileId) {
        console.log("Bank linking completed! Profile:", {
          profileId: urlProfileId,
          connectionId: urlConnectionId,
        });
        setProfileId(urlProfileId);
        setConnectionId(urlConnectionId);

        // Clear URL params after parsing (optional - for cleaner URLs)
        if (window.history.replaceState) {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      }
      return { urlProfileId, urlConnectionId };
    },
  });

  // Note: Connection saving is now handled automatically via Quiltt webhooks
  // No need for manual API calls - webhooks will save connections when they're created

  const {
    data: session,
    error,
    isLoading,
    refetch: refetchSession,
  } = useQuery({
    queryKey: ["quilttSession", user?.id],
    queryFn: async () => {
      // 1. Try localStorage
      const cached = localStorage.getItem(SESSION_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.expiry > Date.now()) {
            console.log("Reusing cached Quiltt session:", parsed);
            return parsed.data;
          }
        } catch (e) {
          console.warn("Failed to parse cached session", e);
        }
      }

      // 2. Clear any stale cached session
      localStorage.removeItem(SESSION_KEY);

      // 3. Fetch new session from backend
      const response = await api.post("/quiltt/sessions");
      console.log("Fetched new Quiltt session:", response.data);

      const toStore = {
        data: response.data,
        expiry: Date.now() + SESSION_TTL,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(toStore));

      return response.data;
    },
    retry: 1,
    enabled: isAuthenticated,
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
      console.log(data);
      return data;
    },
    onSuccess: () => {
      billsQuery.refetch();
    },
  });

  // Function to invalidate and refresh session
  const refreshSession = () => {
    localStorage.removeItem(SESSION_KEY);
    refetchSession();
  };

  // If user is not authenticated, just render children without Quiltt setup
  if (!isAuthenticated) {
    return <>{children}</>;
  }

  if (isLoading) return <p>Loading Quiltt...</p>;
  if (error) return <p>Failed to initialize Quiltt session</p>;
  if (!session?.token) return <p>No session token available</p>;

  return (
    <QuilttSessionContext.Provider value={{ refreshSession }}>
      <QuilttProvider token={session.token}>
        {children}
        <br />
      </QuilttProvider>
    </QuilttSessionContext.Provider>
  );
}
