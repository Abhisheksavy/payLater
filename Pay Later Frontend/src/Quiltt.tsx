import QuilttProviderGate from "./QuilttProviderGate";
import { LinkBankButton } from "./LinkBankButton";
import { BrowserRouter } from "react-router-dom";

export default function Quiltt() {
  return (
    <BrowserRouter>
    <QuilttProviderGate>
      <LinkBankButton />
    </QuilttProviderGate>
    </BrowserRouter>
  );
}
