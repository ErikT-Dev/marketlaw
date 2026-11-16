import { PlayerNameLink } from "../../components/PlayerNameLink";
import type { PublicRoomView } from "../../../shared/protocol/PublicRoomView";
import { Button } from "../../components/Button";
import styles from "./Lobby.module.css";

type Props = {
  readonly rooms: ReadonlyArray<PublicRoomView>;
  readonly onJoin: (code: string) => void;
  readonly isBusy: boolean;
};

function freePlacesOf(room: PublicRoomView): number {
  return Math.max(0, room.size - room.playerNames.length);
}

export function PublicRoomsList({ rooms, onJoin, isBusy }: Props) {
  if (rooms.length === 0) {
    return (
      <div className={styles["emptyList"]}>
        <p className={styles["strong"]}>No public rooms right now</p>
        <p className={styles["small"]}>Create one, or join a private room with its code.</p>
      </div>
    );
  }
  return (
    <ul className={styles["roomList"]} aria-label="Public rooms">
      {rooms.map((room) => {
        const free = freePlacesOf(room);
        return (
          <li key={room.code} className={styles["roomRow"]} aria-label={`${room.ownerName}'s room`}>
            <span className={styles["roomPlayers"]}>
              {room.playerNames.map((name, index) => (
                <span key={name} className={styles["playerChip"]}>
                  <PlayerNameLink name={name} playerId={room.playerIds[index] ?? null} />
                </span>
              ))}
              {Array.from({ length: free }, (unused, index) => (
                <span key={index} className={styles["freeChip"]}>
                  free place
                </span>
              ))}
            </span>
            <span className={styles["roomCount"]}>
              {room.playerNames.length} of {room.size} players · {free} free
            </span>
            <Button
              look="success"
              isDisabled={isBusy || free === 0}
              onClick={() => {
                onJoin(room.code);
              }}
            >
              Join
            </Button>
          </li>
        );
      })}
    </ul>
  );
}
