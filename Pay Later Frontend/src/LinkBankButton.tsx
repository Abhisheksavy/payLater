import { QuilttButton } from "@quiltt/react";

export function LinkBankButton() {

  return (
    <QuilttButton
      connectorId={import.meta.env.VITE_CONNECTOR_ID}
      onExitSuccess={(payload) => {
        console.log("Bank connected!", payload);
      }}
      onExitError={(error) => {
        console.error("Connection error", error);
      }}
      className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground hover:scale-105 transform transition-all duration-300 shadow-glow hover:shadow-xl font-semibold p-2 rounded-xl"
    >
      Connect Bank Account
    </QuilttButton>
  );
}
