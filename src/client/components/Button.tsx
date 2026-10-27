import type { ReactNode } from "react";
import styles from "./Button.module.css";
import type { ButtonStyle } from "./ButtonStyle";

type Props = {
  readonly look: ButtonStyle;
  readonly children: ReactNode;
  readonly onClick?: () => void;
  readonly isDisabled?: boolean;
  readonly loadingLabel?: string | null;
  readonly isSubmit?: boolean;
};

export function Button({
  look,
  children,
  onClick,
  isDisabled = false,
  loadingLabel = null,
  isSubmit = false,
}: Props) {
  const isLoading = loadingLabel !== null;
  return (
    <button
      className={`${styles["button"] ?? ""} ${styles[look] ?? ""}`}
      type={isSubmit ? "submit" : "button"}
      disabled={isDisabled || isLoading}
      aria-busy={isLoading}
      onClick={onClick}
    >
      {isLoading ? loadingLabel : children}
    </button>
  );
}
