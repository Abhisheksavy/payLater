import { QuilttButton } from "@quiltt/react";

interface LinkBankButtonProps {
  onSuccess?: (payload: any) => void;
  onError?: (error: any) => void;
}
  const connectorId = import.meta.env.VITE_CONNECTOR_ID as string;
export function LinkBankButton({ onSuccess, onError }: LinkBankButtonProps) {
  return (
    <QuilttButton
      connectorId={connectorId}
      onExitSuccess={(payload) => {
        console.log("Bank connected!", payload);
        onSuccess?.(payload);
      }}
      onExitError={(error) => {
        console.error("Connection error", error);
        onError?.(error);
      }}
    >
      Link Bank
    </QuilttButton>
  );
}
