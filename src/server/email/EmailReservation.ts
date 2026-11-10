export type EmailReservation =
  | { readonly isOk: true; readonly countedKeys: ReadonlyArray<string> }
  | { readonly isOk: false; readonly reason: "email_limit_reached" | "site_daily_cap" };
