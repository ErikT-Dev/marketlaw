import type { GameRecordSeat } from "../../../shared/api/GameRecordSeat";
import type { IconText } from "../../components/IconText";
import { typesInListOrder } from "../../sorting/typesInListOrder";

export function typeCountsText({ typeCounts }: GameRecordSeat): IconText {
  const counted = typesInListOrder(typeCounts, []).map((type) => ({
    type,
    count: typeCounts[type] ?? 0,
  }));
  return counted.length === 0 ? "none" : counted;
}
