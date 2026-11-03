import styles from "./Screens.module.css";

type Props = {
  readonly connection: string;
};

export function WaitingPage({ connection }: Props) {
  return (
    <main className={styles["page"]}>
      <h1>Connecting</h1>
      <p>Connection: {connection}</p>
    </main>
  );
}
