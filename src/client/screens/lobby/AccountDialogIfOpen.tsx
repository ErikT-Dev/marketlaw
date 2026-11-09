import type { LoginRequest } from "../../../shared/api/LoginRequest";
import type { SignupRequest } from "../../../shared/api/SignupRequest";
import type { ReasonCode } from "../../../shared/ReasonCode";
import type { AccountDialogs } from "./AccountDialogs";
import { LogInDialog } from "./LogInDialog";
import { SignUpDialog } from "./SignUpDialog";

type Props = {
  readonly dialogs: AccountDialogs;
  readonly isGuest: boolean;
  readonly onLogIn: (login: LoginRequest) => Promise<ReasonCode | null>;
  readonly onSignUp: (signup: Omit<SignupRequest, "token">) => Promise<ReasonCode | null>;
};

function closingOnSuccess<Request>(
  send: (request: Request) => Promise<ReasonCode | null>,
  close: () => void,
): (request: Request) => Promise<ReasonCode | null> {
  return async (request) => {
    const problem = await send(request);
    if (problem === null) {
      close();
    }
    return problem;
  };
}

export function AccountDialogIfOpen({ dialogs, isGuest, onLogIn, onSignUp }: Props) {
  const { dialog, close } = dialogs;
  if (dialog === null) {
    return null;
  }
  if (dialog.kind === "log_in") {
    return (
      <LogInDialog
        onSubmit={closingOnSuccess(onLogIn, close)}
        onSignUp={() => void dialogs.openSignUp()}
        onCancel={close}
      />
    );
  }
  return (
    <SignUpDialog
      prefilledName={dialog.prefilledName}
      isGuest={isGuest}
      onSubmit={closingOnSuccess(onSignUp, close)}
      onCancel={close}
    />
  );
}
