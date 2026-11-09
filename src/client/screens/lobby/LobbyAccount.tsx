import type { LoginRequest } from "../../../shared/api/LoginRequest";
import type { SignupRequest } from "../../../shared/api/SignupRequest";
import type { ReasonCode } from "../../../shared/ReasonCode";
import type { AccountBinding } from "../account/AccountBinding";
import { UserAccount } from "../account/UserAccount";
import { AccountButtons } from "./AccountButtons";
import { AccountDialogIfOpen } from "./AccountDialogIfOpen";
import { LobbyTopBar } from "./LobbyTopBar";
import { useAccountDialogs } from "./useAccountDialogs";

type Props = {
  readonly account: AccountBinding | null;
  readonly onLogIn: (login: LoginRequest) => Promise<ReasonCode | null>;
  readonly onSignUp: (signup: Omit<SignupRequest, "token">) => Promise<ReasonCode | null>;
};

export function LobbyAccount({ account, onLogIn, onSignUp }: Props) {
  const dialogs = useAccountDialogs();
  return (
    <>
      <LobbyTopBar>
        {account === null ? (
          <AccountButtons onLogIn={dialogs.openLogIn} onSignUp={() => void dialogs.openSignUp()} />
        ) : (
          <UserAccount account={account} />
        )}
      </LobbyTopBar>
      {account === null ? (
        <AccountDialogIfOpen dialogs={dialogs} onLogIn={onLogIn} onSignUp={onSignUp} />
      ) : null}
    </>
  );
}
