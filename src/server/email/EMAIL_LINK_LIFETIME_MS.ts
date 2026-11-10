import type { LinkedEmailKind } from "./LinkedEmailKind";

const HOUR_MS = 3_600_000;

export const EMAIL_LINK_LIFETIME_MS: Readonly<Record<LinkedEmailKind, number>> = {
  confirm: 24 * HOUR_MS,
  change_confirm: 24 * HOUR_MS,
  reset: HOUR_MS,
};
