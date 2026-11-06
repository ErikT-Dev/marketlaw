import { FUNDS_PER_SOLD_CARD } from "../../../shared/FUNDS_PER_SOLD_CARD";
import { StatChip } from "../../components/StatChip";
import styles from "./ActionsPanel.module.css";
import { counted } from "./counted";

type Props = {
  readonly marked: number;
};

export function SellingNotice({ marked }: Props) {
  return (
    <p className={styles["notice"]}>
      {`Selling: click cards in your hand to mark them, then Sell ${counted(marked, "card")} for `}
      <StatChip stat="funds" value={marked * FUNDS_PER_SOLD_CARD} />
      {". Sold cards cannot be taken back."}
    </p>
  );
}
