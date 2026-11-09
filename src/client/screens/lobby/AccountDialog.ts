export type AccountDialog =
  { readonly kind: "log_in" } | { readonly kind: "sign_up"; readonly prefilledName: string };
