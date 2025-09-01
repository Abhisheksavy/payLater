import { useEffect, useState } from "react";
import { QuilttProvider } from "@quiltt/react";
import { useLocation } from "react-router-dom"; // Add react-router-dom for URL parsing

export default function QuilttProviderGate({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [connectionId, setConnectionId] = useState<string | null>(null); // Store connectionId
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlProfileId = params.get("profileId");
    const urlConnectionId = params.get("connectionId");
    if (urlProfileId) {
      console.log("Parsed from URL:", { profileId: urlProfileId, connectionId: urlConnectionId });
      setProfileId(urlProfileId);
      setConnectionId(urlConnectionId);
    }
  }, [location]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5000/api/quiltt/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const json = await res.json();
        if (!json.token) {
          throw new Error("No token received from backend");
        }
        console.log("Session token fetched:", json.token);
        setToken(json.token);
      } catch (err) {
        console.error("Error fetching session token:", err);
        setError("Failed to initialize Quiltt session");
      }
    })();
  }, []);

  if (error) return <p>{error}</p>;
  if (!token) return <p>Loading Quiltt...</p>;

  return (
    <QuilttProvider token={token}>
      {children}
      <br />
      {profileId && (
        <div>
          <p>Connected Profile ID: {profileId}</p>
          <p>Connection ID: {connectionId || "N/A"}</p>
          <button
            onClick={async () => {
              try {
                const res = await fetch(`http://localhost:5000/api/quiltt/transactions/${profileId}`);
                if (!res.ok) {
                  throw new Error(`Failed to fetch transactions: ${await res.text()}`);
                }
                const data = await res.json();
                console.log("Transactions:", data);
              } catch (err) {
                console.error("Error fetching transactions:", err);
              }
            }}
          >
            Fetch Transactions
          </button>
          <br />
          <button
            onClick={async () => {
              try {
                const res = await fetch(`http://localhost:5000/api/quiltt/accounts/${profileId}`);
                if (!res.ok) {
                  throw new Error(`Failed to fetch accounts: ${await res.text()}`);
                }
                const data = await res.json();
                console.log("Accounts:", data);
              } catch (err) {
                console.error("Error fetching accounts:", err);
              }
            }}
          >
            Fetch Accounts
          </button>
        </div>
      )}
    </QuilttProvider>
  );
}