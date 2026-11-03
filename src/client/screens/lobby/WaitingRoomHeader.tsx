import type { RoomView } from "../../../shared/protocol/RoomView";
import { Button } from "../../components/Button";
import styles from "./Lobby.module.css";

type Props = {
  readonly room: RoomView;
  readonly isOwner: boolean;
  readonly onLeave: () => void;
};

export function WaitingRoomHeader({ room, isOwner, onLeave }: Props) {
  const kind = room.isPublic ? "Public room" : "Private room";
  return (
    <div className={styles["panelHeader"]}>
      <div>
        <h2 id="room-heading" className={styles["roomTitle"]}>
          Room {room.code}
        </h2>
        <p className={styles["small"]}>
          {kind} · {isOwner ? "you are the owner" : `owner: ${room.ownerName}`}
        </p>
      </div>
      <div className={styles["dialogButtons"]}>
        <Button look="secondary" onClick={() => void navigator.clipboard.writeText(room.code)}>
          Copy room code
        </Button>
        <Button look="danger" onClick={onLeave}>
          Leave room
        </Button>
      </div>
    </div>
  );
}
