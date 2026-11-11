import type { AccountResponse } from "../../../shared/api/AccountResponse";
import type { EmailChangeRequest } from "../../../shared/api/EmailChangeRequest";
import type { PlayerId } from "../../../shared/PlayerId";
import type { SignupRequest } from "../../../shared/api/SignupRequest";
import type { ReasonCode } from "../../../shared/ReasonCode";

export type AccountBinding = {
  readonly playerId: PlayerId | null;
  readonly name: string;
  readonly isGuest: boolean;
  readonly isInGame: boolean;
  readonly onSignUp: (signup: Omit<SignupRequest, "token">) => Promise<ReasonCode | null>;
  readonly onChangeUsername: (username: string) => Promise<ReasonCode | null>;
  readonly onLoadAccount: () => Promise<AccountResponse | null>;
  readonly onChangeEmail: (change: Omit<EmailChangeRequest, "token">) => Promise<ReasonCode | null>;
  readonly onSendConfirmationAgain: () => Promise<ReasonCode | null>;
  readonly onDeleteAccount: (password: string) => Promise<ReasonCode | null>;
  readonly onLogOut: () => Promise<void>;
};
