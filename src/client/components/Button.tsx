import { useId, type ReactNode } from "react";
import styles from "./Button.module.css";
import type { ButtonStyle } from "./ButtonStyle";

type Props = {
  readonly look: ButtonStyle;
  readonly children: ReactNode;
  readonly onClick?: () => void;
  readonly isDisabled?: boolean;
  readonly loadingLabel?: string | null;
  readonly isSubmit?: boolean;
  readonly highlightReason?: string | null;
};

export function Button({
  look,
  children,
  onClick,
  isDisabled = false,
  loadingLabel = null,
  isSubmit = false,
  highlightReason = null,
}: Props) {
  const reasonId = useId();
  const isLoading = loadingLabel !== null;
  const isHighlighted = highlightReason !== null;
  return (
    <>
      <button
        className={`${styles["button"] ?? ""} ${styles[look] ?? ""} ${isHighlighted ? (styles["highlighted"] ?? "") : ""}`}
        type={isSubmit ? "submit" : "button"}
        disabled={isDisabled || isLoading}
        aria-busy={isLoading}
        aria-describedby={isHighlighted ? reasonId : undefined}
        onClick={onClick}
      >
        {isLoading ? loadingLabel : children}
      </button>
      {isHighlighted ? (
        <span id={reasonId} className={styles["visuallyHidden"]}>
          {highlightReason}
        </span>
      ) : null}
    </>
  );
}
