import { clockText } from "../../components/clockText";
import styles from "./Marketplace.module.css";
import { useServerNow } from "./useServerNow";

type Props = {
  readonly deadline: number;
};

const FINAL_SECONDS_MS = 5_000;

export function MarketCountdown({ deadline }: Props) {
  const now = useServerNow();
  const leftMs = Math.max(0, deadline - now);
  const text = clockText(leftMs);
  const isInFinalSeconds = leftMs <= FINAL_SECONDS_MS;
  return (
    <span
      className={`${styles["countdown"] ?? ""} ${isInFinalSeconds ? (styles["finalSeconds"] ?? "") : ""}`}
      role="timer"
      aria-label={`Your market go ${text} left`}
    >
      {text}
    </span>
  );
}
