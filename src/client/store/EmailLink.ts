export type EmailLink =
  | { readonly kind: "confirm"; readonly link: string }
  | { readonly kind: "reset"; readonly link: string }
  | { readonly kind: "forgot_password" };
