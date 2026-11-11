import { useId } from "react";
import styles from "./MarketPhaseBanner.module.css";

type Props = {
  readonly goText: string | null;
  readonly isYourGo: boolean;
};

export function MarketPhaseBanner({ goText, isYourGo }: Props) {
  const titleId = useId();
  return (
    <section className={styles[isYourGo ? "yourGo" : "banner"]} aria-labelledby={titleId}>
      <h2 id={titleId} className={styles["title"]}>
        MARKET PHASE
      </h2>
      {goText === null ? null : <p className={styles["go"]}>{goText}</p>}
    </section>
  );
}
