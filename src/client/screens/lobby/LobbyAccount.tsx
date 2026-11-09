import type { LoginRequest } from "../../../shared/api/LoginRequest";
import type { SignupRequest } from "../../../shared/api/SignupRequest";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { AccountButtons } from "./AccountButtons";
import { AccountDialogIfOpen } from "./AccountDialogIfOpen";
import { LobbyTopBar } from "./LobbyTopBar";
import { useAccountDialogs } from "./useAccountDialogs";
import { UserBox } from "./UserBox";

type Props = {
  readonly name: string | null;
  readonly isGuest: boolean;
  readonly onLogIn: (login: LoginRequest) => Promise<ReasonCode | null>;
  readonly onSignUp: (signup: Omit<SignupRequest, "token">) => Promise<ReasonCode | null>;
};

export function LobbyAccount({ name, isGuest, onLogIn, onSignUp }: Props) {
  const dialogs = useAccountDialogs(name);
  return (
    <>
      <LobbyTopBar>
        {name === null ? (
          <AccountButtons onLogIn={dialogs.openLogIn} onSignUp={() => void dialogs.openSignUp()} />
        ) : (
          <UserBox name={name} isGuest={isGuest} />
        )}
      </LobbyTopBar>
      <AccountDialogIfOpen
        dialogs={dialogs}
        isGuest={isGuest}
        onLogIn={onLogIn}
        onSignUp={onSignUp}
      />
    </>
  );
}
