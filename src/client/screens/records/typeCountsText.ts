import type { GameRecordSeat } from "../../../shared/api/GameRecordSeat";
import { TYPE_NAMES } from "../../../shared/catalogue/TYPE_NAMES";
import type { IconText } from "../../components/IconText";

export function typeCountsText({ typeCounts }: GameRecordSeat): IconText {
  const counted = TYPE_NAMES.flatMap((type) => {
    const count = typeCounts[type] ?? 0;
    return count > 0 ? [{ type, count }] : [];
  });
  return counted.length === 0 ? "none" : counted;
}
