import type { Sector } from "../../../shared/catalogue/Sector";
import { iconUrl } from "../../icons/iconUrl";
import styles from "./QuestsPanel.module.css";
import { SectorNamedText } from "./SectorNamedText";

type Props = {
  readonly amount: string;
  readonly label: string;
  readonly sector: Sector | null;
  readonly iconFile: string | null;
  readonly spokenText: string;
};

export function QuestPart({ amount, label, sector, iconFile, spokenText }: Props) {
  return (
    <span className={styles["part"]} role="img" aria-label={spokenText}>
      <span aria-hidden="true">{amount}</span>
      {iconFile === null ? (
        <span aria-hidden="true">
          <SectorNamedText text={label} sector={sector} />
        </span>
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
