import type { AccountDialog } from "./AccountDialog";

export type AccountDialogs = {
  readonly dialog: AccountDialog | null;
  readonly openLogIn: () => void;
  readonly openSignUp: () => Promise<void>;
  readonly close: () => void;
};
