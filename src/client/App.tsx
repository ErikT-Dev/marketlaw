import styles from "./App.module.css";
import { usePressHistory } from "./usePressHistory";
import { useRoomConnection } from "./useRoomConnection";

export function App() {
  const { pressCount, isConnected, press } = useRoomConnection();
  const recentPresses = usePressHistory(pressCount);

  return (
    <main className={styles["page"]}>
      <p className={styles["count"]} aria-live="polite" aria-label="Total presses">
        {pressCount ?? "–"}
      </p>
      <button type="button" className={styles["button"]} onClick={press} disabled={!isConnected}>
        Press
      </button>
      <p className={styles["status"]}>{isConnected ? "Connected" : "Connecting…"}</p>
      <section className={styles["history"]} aria-labelledby="recent-presses-heading">
        <h2 id="recent-presses-heading" className={styles["historyHeading"]}>
          Recent presses
        </h2>
        {recentPresses.length === 0 ? (
          <p className={styles["status"]}>None yet</p>
        ) : (
          <ol className={styles["historyList"]}>
            {recentPresses.map((recentPress) => (
              <li key={recentPress.pressNumber}>
                #{recentPress.pressNumber} at{" "}
                {new Date(recentPress.pressedAtEpochMs).toLocaleTimeString()}
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
