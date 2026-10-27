import type { TypeName } from "../../shared/catalogue/TypeName";
import { iconUrl } from "../icons/iconUrl";
import { typeIconFile } from "../icons/typeIconFile";
import styles from "./Chip.module.css";

type Props = {
  readonly type: TypeName;
  readonly count?: number | undefined;
};

export function TypeChip({ type, count }: Props) {
  return (
    <span
      className={styles["chip"]}
      role="img"
      aria-label={count === undefined ? type : `${type} ${String(count)}`}
    >
      <img className={styles["icon"]} src={iconUrl(typeIconFile(type))} alt="" />
      {count === undefined ? null : <span aria-hidden="true">{count}</span>}
      <span className={styles["tooltip"]} aria-hidden="true">
        {type}
      </span>
    </span>
  );
}
