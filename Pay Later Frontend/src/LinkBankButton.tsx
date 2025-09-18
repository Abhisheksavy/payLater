import { QuilttButton } from "@quiltt/react";

interface LinkBankButtonProps {
  onSuccess?: (payload: any) => void;
  onError?: (error: any) => void;
}

export function LinkBankButton({ onSuccess, onError }: LinkBankButtonProps) {
  return (
    <QuilttButton
      connectorId="c2frh6zji7"
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
