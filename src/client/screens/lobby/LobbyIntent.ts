export type LobbyIntent =
  { readonly kind: "join"; readonly code: string } | { readonly kind: "create" };
