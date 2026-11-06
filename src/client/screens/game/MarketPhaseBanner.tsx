import { useId } from "react";
import styles from "./MarketPhaseBanner.module.css";

type Props = {
  readonly goText: string | null;
};

export function MarketPhaseBanner({ goText }: Props) {
  const titleId = useId();
  return (
    <section className={styles["banner"]} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles["title"]}>
        MARKET PHASE
      </h2>
      {goText === null ? null : <p className={styles["go"]}>{goText}</p>}
    </section>
  );
}
