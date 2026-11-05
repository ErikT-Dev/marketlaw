import type { ReasonCode } from "../../shared/ReasonCode";
import type { AddressedNotice } from "./AddressedNotice";
import type { RoomChange } from "./RoomChange";

export type RoomActionChange = RoomChange & {
  readonly notices: ReadonlyArray<AddressedNotice>;
  readonly refusal: ReasonCode | null;
};
