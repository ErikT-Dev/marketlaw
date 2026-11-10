export type EmailDialog =
  | { readonly kind: "check_email"; readonly address: string }
  | { readonly kind: "email_confirmed" }
  | { readonly kind: "new_password"; readonly link: string }
  | { readonly kind: "link_expired"; readonly unconfirmedAddress: string | null }
  | { readonly kind: "forgot_password" };
