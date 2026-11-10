import type { PlayerId } from "../../shared/PlayerId";

export type EmailAccount = {
  readonly playerId: PlayerId;
  readonly isGuest: boolean;
  readonly unconfirmedEmail: string | null;
};
