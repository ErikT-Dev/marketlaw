import type { ReactNode } from "react";
import type { GameRecordSeat } from "../../../shared/api/GameRecordSeat";
import type { IconText } from "../../components/IconText";

export type GameRecordRow = {
  readonly label: IconText;
  readonly valueOf: (seat: GameRecordSeat) => ReactNode;
};
