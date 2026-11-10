import type { ReasonCode } from "../../../shared/ReasonCode";
import { TextWithIcons } from "../../components/TextWithIcons";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";
import styles from "./Email.module.css";

type Props = {
  readonly problem: ReasonCode | null;
};

export function EmailProblem({ problem }: Props) {
  return problem === null ? null : (
    <p role="alert" className={styles["error"]}>
      <TextWithIcons text={REJECTION_MESSAGES[problem]} />
    </p>
  );
}
