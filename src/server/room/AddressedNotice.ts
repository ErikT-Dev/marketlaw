import type { Notice } from "../../shared/Notice";
import type { PlayerId } from "../../shared/PlayerId";

export type AddressedNotice = {
  readonly playerId: PlayerId;
  readonly notice: Notice;
};
