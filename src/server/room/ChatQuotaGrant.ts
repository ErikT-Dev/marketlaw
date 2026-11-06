export type ChatQuotaGrant =
  { readonly kind: "granted"; readonly count: number } | { readonly kind: "no_answer" };
