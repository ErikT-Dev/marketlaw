import type { AccountEmailKind } from "./AccountEmailKind";

export type LinkedEmailKind = Exclude<AccountEmailKind, "already_in_use">;
