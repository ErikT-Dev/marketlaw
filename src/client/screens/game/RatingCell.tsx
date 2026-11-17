import type { SeatRatingView } from "../../../shared/protocol/SeatRatingView";
import { ratingChangeText } from "../../components/ratingChangeText";
import styles from "./GameOverDialog.module.css";

type Props = {
  readonly rating: SeatRatingView | undefined;
};

function changeClassOf(change: number): string | undefined {
  if (change > 0) {
    return styles["ratingGain"];
  }
  return change < 0 ? styles["ratingLoss"] : undefined;
}

export function RatingCell({ rating }: Props) {
  if (rating === undefined) {
    return <td />;
  }
  const change = rating.after - rating.before;
  return (
    <td className={changeClassOf(change)}>
      {`${String(rating.before)} → ${String(rating.after)} (${ratingChangeText(change)})`}
    </td>
  );
}
