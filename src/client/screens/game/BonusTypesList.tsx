import type { TypeName } from "../../../shared/catalogue/TypeName";
import { TYPE_POINTS } from "../../../shared/catalogue/TYPE_POINTS";
import { TypeChip } from "../../components/TypeChip";
import styles from "./Marketplace.module.css";

type Props = {
  readonly bonusTypes: ReadonlyArray<TypeName>;
};

export function BonusTypesList({ bonusTypes }: Props) {
  return (
    <span className={styles["bonusTypes"]}>
      Bonus types:
      {bonusTypes.map((type) => (
        <span key={type} className={styles["bonusType"]}>
          <TypeChip type={type} />
          {TYPE_POINTS[type]} pts
        </span>
      ))}
    </span>
  );
}
