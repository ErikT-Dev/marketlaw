import { Sector } from "../../../shared/catalogue/Sector";
import { sectorColor } from "../../components/sectorColor";
import styles from "./MarketGoPanel.module.css";

type Props = {
  readonly isBusy: boolean;
  readonly onChoose: (sector: Sector) => void;
};

export function SectorButtons({ isBusy, onChoose }: Props) {
  return (
    <div className={styles["sectors"]}>
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
