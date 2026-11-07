import type { ReactNode } from "react";
import type { RoomView } from "../../../shared/protocol/RoomView";
import { Button } from "../../components/Button";
import styles from "./Lobby.module.css";

type Props = {
  readonly room: RoomView;
  readonly subtitle: ReactNode;
  readonly onLeave: () => void;
  readonly children: ReactNode;
};

export function WaitingRoomHeader({ room, subtitle, onLeave, children }: Props) {
  return (
    <div className={styles["panelHeader"]}>
      <div>
        <h2 id="room-heading" className={styles["roomTitle"]}>
          Room {room.code}
        </h2>
        <div className={styles["small"]}>{subtitle}</div>
      </div>
      <div className={styles["dialogButtons"]}>
        {children}
        <Button look="danger" onClick={onLeave}>
          Leave room
        </Button>
      </div>
    </div>
  );
}
