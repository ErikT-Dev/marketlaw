import styles from "./ActionsPanel.module.css";
import { listedNames } from "./listedNames";

type Props = {
  readonly waitingFor: ReadonlyArray<string>;
};

export function DoneBanner({ waitingFor }: Props) {
  return (
    <div className={styles["done"]} role="status">
      <strong>You are done for this turn</strong>
      {waitingFor.length === 0 ? null : <span>{`Waiting for ${listedNames(waitingFor)}.`}</span>}
    </div>
  );
}
