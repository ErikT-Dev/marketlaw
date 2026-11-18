import type { ServerMessage } from "../../shared/protocol/ServerMessage";
import type { ConnectionState } from "../room/ConnectionState";

export type TutorialOutcome =
  | { readonly kind: "open"; readonly reply: ServerMessage; readonly connection: ConnectionState }
  | { readonly kind: "closing"; readonly reply: ServerMessage | null };
