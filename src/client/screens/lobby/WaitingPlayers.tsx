import type { RoomView } from "../../../shared/protocol/RoomView";
import styles from "./Lobby.module.css";

type Props = {
  readonly room: RoomView;
  readonly myName: string;
};

function markOf(name: string, room: RoomView, myName: string): string {
  const marks = [
    ...(name === room.ownerName ? ["owner"] : []),
    ...(name === myName ? ["you"] : []),
  ];
  return marks.join(" · ");
}

export function WaitingPlayers({ room, myName }: Props) {
  const free = Math.max(0, room.size - room.playerNames.length);
  return (
    <section aria-labelledby="waiting-players">
      <h3 id="waiting-players" className={styles["label"]}>
        Players · {room.playerNames.length} of {room.size}
      </h3>
      <ul className={styles["playerList"]} aria-label="Players in the room">
        {room.playerNames.map((name) => (
          <li key={name} className={styles["playerRow"]}>
            <span className={styles["online"]} aria-hidden="true" />
            <strong>{name === myName ? "You" : name}</strong>
            <span className={styles["ownerMark"]}>{markOf(name, room, myName)}</span>
          </li>
        ))}
        {free === 0 ? null : (
          <li className={styles["freePlace"]}>
            Free place: waiting for {free} more {free === 1 ? "player" : "players"}
          </li>
        )}
      </ul>
    </section>
  );
}
