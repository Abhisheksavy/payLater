import { Button } from "@/components/ui/button";
import { LinkBankButton } from "./LinkBankButton";
import { useQuilttSession } from "@/QuilttProviderGate";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Unlink } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import api from "./lib/axios";

export default function Quiltt() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { refreshSession } = useQuilttSession();

  // Fetch connected banks
  const { data: connectionsData } = useQuery({
    queryKey: ["userConnections"],
    queryFn: async () => {
      const { data } = await api.get("/quiltt/user-connections");
      return data;
    },
    enabled: !!user,
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: async (connectionId: string) => {
      const { data } = await api.delete(`/quiltt/connections/${connectionId}`);
      return data;
    },
    onSuccess: () => {
      refreshSession();
      queryClient.invalidateQueries({ queryKey: ["userConnections"] });
      toast({
        title: "Bank Unlinked",
        description: "Your bank connection has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Unlink Failed",
        description: error.response?.data?.message || "Failed to unlink bank. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Show unlink button if bank is connected, otherwise show link button
  if (connectionsData?.connections?.length > 0) {
    const firstConnection = connectionsData.connections[0];
    return (
      <Button
        variant="destructive"
        size="sm"
        className="gap-2"
        onClick={() => disconnectMutation.mutate(firstConnection.id)}
        disabled={disconnectMutation.isPending}
      >
        {disconnectMutation.isPending ? (
          <>
            <div className="w-4 h-4 animate-spin rounded-full border-2 border-transparent border-t-current" />
            Unlinking...
          </>
        ) : (
          <>
            <Unlink className="w-4 h-4" />
            Unlink Bank
          </>
        )}
      </Button>
    );
  }

  return (
    <LinkBankButton
      onSuccess={() => {
        refreshSession();
        queryClient.invalidateQueries({ queryKey: ["userConnections"] });
      }}
      onError={(error) => {
        if (error.message?.includes("Session token")) {
          refreshSession();
        }
        toast({
          title: "Connection Failed",
          description: error.message || "Failed to connect bank. Please try again.",
          variant: "destructive",
        });
      }}
    />
  );
}
