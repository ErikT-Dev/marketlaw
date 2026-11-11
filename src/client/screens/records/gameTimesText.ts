import type { GameRecordView } from "../../../shared/api/GameRecordView";
import { gameDurationText } from "./gameDurationText";
import { recordDateText } from "./recordDateText";
import { recordTimeText } from "./recordTimeText";

export function gameTimesText({ startedAt, endedAt }: GameRecordView): string {
  const startedDay = recordDateText(startedAt);
  const started =
    startedDay === recordDateText(endedAt)
      ? recordTimeText(startedAt)
      : `${startedDay} ${recordTimeText(startedAt)}`;
  return `started ${started}, ended ${recordTimeText(endedAt)} (${gameDurationText(startedAt, endedAt)})`;
}
