import type { AccountResponse } from "../../../shared/api/AccountResponse";

export type LoggedInAccount = Extract<AccountResponse, { readonly isLoggedIn: true }>;
