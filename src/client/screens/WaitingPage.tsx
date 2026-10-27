import type { RoomView } from "../../shared/protocol/RoomView";
import styles from "./Screens.module.css";

type Props = {
  readonly room: RoomView | null;
  readonly connection: string;
};

export function WaitingPage({ room, connection }: Props) {
  if (room === null) {
    return (
      <main className={styles["page"]}>
        <h1>Connecting</h1>
        <p>Connection: {connection}</p>
      </main>
    );
  }
  return (
    <main className={styles["page"]}>
      <h1>Waiting for players</h1>
      <p>
        Room code: <strong aria-label="Room code">{room.code}</strong>
      </p>
      <p>
        {room.playerNames.length} of {room.size} players
      </p>
      <ul className={styles["list"]} aria-label="Players in the room">
        {room.playerNames.map((name, index) => (
          <li key={`${String(index)}-${name}`}>{name}</li>
        ))}
      </ul>
    </main>
  );
}
