import { TYPE_NAMES } from "../../../shared/catalogue/TYPE_NAMES";
import type { TypeName } from "../../../shared/catalogue/TypeName";
import type { SeatTypeCounts } from "../../../shared/SeatTypeCounts";
import { TypeChip } from "../../components/TypeChip";
import styles from "./YourStatsPanel.module.css";

type Props = {
  readonly typeCounts: SeatTypeCounts;
  readonly bonusTypes: ReadonlyArray<TypeName>;
  readonly label: string;
};

export function TypeCountsList({ typeCounts, bonusTypes, label }: Props) {
  const others = TYPE_NAMES.filter((type) => !bonusTypes.includes(type));
  const shown = [...bonusTypes, ...others].filter((type) => (typeCounts[type] ?? 0) > 0);
  return shown.length === 0 ? null : (
    <ul className={styles["types"]} aria-label={label}>
      {shown.map((type) => (
        <li key={type}>
          <TypeChip type={type} count={typeCounts[type] ?? 0} />
        </li>
      ))}
    </ul>
  );
}
