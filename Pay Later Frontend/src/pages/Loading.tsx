import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useAuth } from "@/contexts/AuthContext";

const Loading = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
const { data, isSuccess } = useQuery({
  queryKey: ["parseUrlParams", location.search],
  queryFn: async () => {
    const params = new URLSearchParams(location.search);
    const profileId = params.get("profileId");
    const connectionId = params.get("connectionId");

    if (profileId) {
      await api.post("/user/updateConnectionDetails", {
        profileId,
        connectionId,
        userId: user.id,
      });
    }

    return { profileId, connectionId };
  },
});

useEffect(() => {
  if (isSuccess && data?.profileId) {
    navigate("/dashboard", { replace: true });
  }
}, [isSuccess, data, navigate]);



  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <h2 className="text-xl font-semibold">Setting things up...</h2>
    </div>
  );
};

export default Loading;
