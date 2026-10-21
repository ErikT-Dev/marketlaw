import styles from "./App.module.css";
import { useRoomConnection } from "./useRoomConnection";

export function App() {
  const { pressCount, isConnected, press } = useRoomConnection();

  return (
    <main className={styles["page"]}>
      <p className={styles["count"]} aria-live="polite" aria-label="Total presses">
        {pressCount ?? "–"}
      </p>
      <button type="button" className={styles["button"]} onClick={press} disabled={!isConnected}>
        Press
      </button>
      <p className={styles["status"]}>{isConnected ? "Connected" : "Connecting…"}</p>
    </main>
  );
}
