import { iconUrl } from "../../icons/iconUrl";
import styles from "./QuestsPanel.module.css";

type Props = {
  readonly amount: string;
  readonly label: string;
  readonly iconFile: string | null;
  readonly spokenText: string;
};

export function QuestPart({ amount, label, iconFile, spokenText }: Props) {
  return (
    <span className={styles["part"]} role="img" aria-label={spokenText}>
      <span aria-hidden="true">{amount}</span>
      {iconFile === null ? (
        <span aria-hidden="true">{label}</span>
      ) : (
        <>
          <img className={styles["icon"]} src={iconUrl(iconFile)} alt="" />
          <span className={styles["tooltip"]} aria-hidden="true">
            {label}
          </span>
        </>
      )}
    </span>
  );
}
