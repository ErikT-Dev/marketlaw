import type { AccountResponse } from "../../../shared/api/AccountResponse";
import type { SignupRequest } from "../../../shared/api/SignupRequest";
import type { ReasonCode } from "../../../shared/ReasonCode";

export type AccountBinding = {
  readonly name: string;
  readonly isGuest: boolean;
  readonly onSignUp: (signup: Omit<SignupRequest, "token">) => Promise<ReasonCode | null>;
  readonly onChangeUsername: (username: string) => Promise<ReasonCode | null>;
  readonly onLoadAccount: () => Promise<AccountResponse | null>;
  readonly onLogOut: () => Promise<void>;
};
