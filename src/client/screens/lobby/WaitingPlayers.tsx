import { PlayerNameLink } from "../../components/PlayerNameLink";
import type { RoomView } from "../../../shared/protocol/RoomView";
import styles from "./Lobby.module.css";

type Props = {
  readonly room: RoomView;
  readonly myName: string;
  readonly isAfterGame: boolean;
};

function markOf(name: string, room: RoomView, myName: string): string {
  const marks = [
    ...(name === room.ownerName ? ["owner"] : []),
    ...(name === myName ? ["you"] : []),
  ];
  return marks.join(" · ");
}

export function WaitingPlayers({ room, myName, isAfterGame }: Props) {
  const names = isAfterGame ? room.namesInRoom : room.playerNames;
  const ids = isAfterGame ? room.idsInRoom : room.playerIds;
  const free = isAfterGame ? 0 : Math.max(0, room.size - names.length);
  return (
    <section aria-labelledby="waiting-players">
      <h3 id="waiting-players" className={styles["label"]}>
        {isAfterGame
          ? `Players still in the room · ${String(names.length)}`
          : `Players · ${String(names.length)} of ${String(room.size)}`}
      </h3>
      <ul className={styles["playerList"]} aria-label="Players in the room">
        {names.map((name, index) => (
          <li key={name} className={styles["playerRow"]}>
            <span className={styles["online"]} aria-hidden="true" />
            <strong>
              {name === myName ? (
                "You"
              ) : (
                <PlayerNameLink name={name} playerId={ids[index] ?? null} />
              )}
            </strong>
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
