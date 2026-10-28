import styles from "./ActionsPanel.module.css";

type Props = {
  readonly waitingFor: ReadonlyArray<string>;
};

function listed(names: ReadonlyArray<string>): string {
  if (names.length <= 1) {
    return names.join("");
  }
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1) ?? ""}`;
}

export function DoneBanner({ waitingFor }: Props) {
  return (
    <div className={styles["done"]} role="status">
      <strong>You are done for this turn</strong>
      <span>
        {waitingFor.length === 0 ? "" : `Waiting for ${listed(waitingFor)}. `}
        The turn ends when everyone is done or out of time.
      </span>
    </div>
  );
}
