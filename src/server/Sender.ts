import type { Identity } from "./room/Identity";

export type Sender = { readonly identity: Identity; readonly tokenHash: string };
