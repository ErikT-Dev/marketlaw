import type { PlayerId } from "../shared/PlayerId";

export type LoginClosing = { readonly tokenHash: string } | { readonly playerId: PlayerId };
