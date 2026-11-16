import type { QueueNotice } from "../../shared/protocol/QueueNotice";

export type LobbyQueueNotice = Exclude<
  QueueNotice,
  { readonly kind: "match_found" } | { readonly kind: "match_started" }
>;
