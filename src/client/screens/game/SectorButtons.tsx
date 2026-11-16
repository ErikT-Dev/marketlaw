import { Sector } from "../../../shared/catalogue/Sector";
import { sectorColor } from "../../components/sectorColor";
import styles from "./MarketGoPanel.module.css";

type Props = {
  readonly isBusy: boolean;
  readonly onChoose: (sector: Sector) => void;
  readonly isCompact?: boolean;
};

export function SectorButtons({ isBusy, onChoose, isCompact = false }: Props) {
  return (
    <div className={styles[isCompact ? "sectorsCompact" : "sectors"]}>
      {Sector.options.map((sector) => (
        <button
          key={sector}
          type="button"
          className={styles["sector"]}
          style={{ background: sectorColor(sector, "card") }}
          disabled={isBusy}
          onClick={() => {
            onChoose(sector);
          }}
        >
          {sector}
        </button>
      ))}
    </div>
  );
}
