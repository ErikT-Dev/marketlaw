import type { LoginRequest } from "../../../shared/api/LoginRequest";
import type { SignupRequest } from "../../../shared/api/SignupRequest";
import type { ReasonCode } from "../../../shared/ReasonCode";
import type { AccountBinding } from "../account/AccountBinding";
import { AccountButtons } from "./AccountButtons";
import { AccountDialogIfOpen } from "./AccountDialogIfOpen";
import { LobbyTopBar } from "./LobbyTopBar";
import { LoggedInLobbyBar } from "./LoggedInLobbyBar";
import { useAccountDialogs } from "./useAccountDialogs";
import type { GameMenuPlace } from "../menu/GameMenuPlace";

type Props = {
  readonly menuPlace: Extract<GameMenuPlace, "lobby" | "ranked_queue">;
  readonly account: AccountBinding | null;
  readonly rating: number | null;
  readonly onLogIn: (login: LoginRequest) => Promise<ReasonCode | null>;
  readonly onSignUp: (signup: Omit<SignupRequest, "token">) => Promise<ReasonCode | null>;
  readonly onForgotPassword: () => void;
};

export function LobbyAccount(props: Props) {
  const { menuPlace, account, rating, onLogIn, onSignUp, onForgotPassword } = props;
  const dialogs = useAccountDialogs();
  return (
    <>
      <LobbyTopBar menuPlace={menuPlace}>
        {account === null ? (
          <AccountButtons onLogIn={dialogs.openLogIn} onSignUp={() => void dialogs.openSignUp()} />
        ) : (
          <LoggedInLobbyBar account={account} rating={rating} />
        )}
      </LobbyTopBar>
      {account === null ? (
        <AccountDialogIfOpen
          dialogs={dialogs}
          onLogIn={onLogIn}
          onSignUp={onSignUp}
          onForgotPassword={onForgotPassword}
        />
      ) : null}
    </>
  );
}
