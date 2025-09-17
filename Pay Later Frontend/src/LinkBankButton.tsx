import { QuilttButton } from "@quiltt/react";

export function LinkBankButton() {
  return (
    <QuilttButton
      connectorId="c2frh6zji7"
      onExitSuccess={(payload) => {
        console.log("Bank connected!", payload);
      }}
      onExitError={(error) => {
        console.error("Connection error", error);
      }}
    >
      Link Bank
    </QuilttButton>
  );
}
