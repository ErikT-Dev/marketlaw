import type { TypeName } from "../../../shared/catalogue/TypeName";
import type { SeatTypeCounts } from "../../../shared/SeatTypeCounts";
import { TypeChip } from "../../components/TypeChip";
import styles from "./TypeCountsList.module.css";

type Props = {
  readonly types: ReadonlyArray<TypeName>;
  readonly typeCounts: SeatTypeCounts;
  readonly bonusTypes: ReadonlyArray<TypeName>;
  readonly label: string;
};

export function TypeCountsList({ types, typeCounts, bonusTypes, label }: Props) {
  return types.length === 0 ? null : (
    <ul className={styles["types"]} aria-label={label}>
      {types.map((type) => (
        <li key={type} className={bonusTypes.includes(type) ? styles["bonusType"] : styles["type"]}>
          <TypeChip type={type} count={typeCounts[type] ?? 0} />
        </li>
      ))}
    </ul>
  );
}
