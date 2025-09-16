import { QuilttButton } from "@quiltt/react";

export function LinkBankButton() {
  return (
    <QuilttButton
      connectorId="hfv9ei25q2"
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
