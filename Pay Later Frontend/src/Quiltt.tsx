import QuilttProviderGate from "./QuilttProviderGate";
import { LinkBankButton } from "./LinkBankButton";
import { BrowserRouter } from "react-router-dom";

export default function Quiltt() {
  return (
    <QuilttProviderGate>
      <LinkBankButton />
    </QuilttProviderGate>
  );
}
