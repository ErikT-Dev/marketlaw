import { useEffect } from "react";
import { HumanCheck } from "./HumanCheck";
import styles from "./Lobby.module.css";
import { useHumanCheck } from "./useHumanCheck";

type Props = {
  readonly attempt: number;
  readonly onTokenChange: (token: string) => void;
};

export function LoginHumanCheck({ attempt, onTokenChange }: Props) {
  const { containerRef, token, isUnavailable } = useHumanCheck(attempt);
  useEffect(() => {
    onTokenChange(token);
  }, [token, onTokenChange]);
  return (
    <>
      <p className={styles["small"]}>
        After 3 failed attempts in 15 minutes, every login on this account needs the human check for
        the next 15 minutes. The account is never locked.
      </p>
      <HumanCheck containerRef={containerRef} isUnavailable={isUnavailable} />
    </>
  );
}
