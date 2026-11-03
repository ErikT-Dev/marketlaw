import type { RoomView } from "../../../shared/protocol/RoomView";
import { useServerNow } from "../game/useServerNow";
import { AcceptDialog } from "./AcceptDialog";
import styles from "./Lobby.module.css";
import { LobbyTopBar } from "./LobbyTopBar";
import { RoomSizeChoice } from "./RoomSizeChoice";
import { WaitingPlayers } from "./WaitingPlayers";
import { WaitingRoomHeader } from "./WaitingRoomHeader";

type Props = {
  readonly room: RoomView;
  readonly myName: string;
  readonly onChangeSize: (size: 2 | 3 | 4) => void;
  readonly onLeave: () => void;
  readonly onAccept: () => void;
  readonly onDecline: () => void;
};

export function WaitingRoomPage(props: Props) {
  const { room, myName, onChangeSize, onLeave, onAccept, onDecline } = props;
  const now = useServerNow();
  const isOwner = room.ownerName === myName;
  return (
    <div className={styles["page"]}>
      <LobbyTopBar name={myName} />
      <main className={styles["columns"]}>
        <section className={styles["panel"]} aria-labelledby="room-heading">
          <WaitingRoomHeader room={room} isOwner={isOwner} onLeave={onLeave} />
          <div className={styles["sizeRow"]}>
            <RoomSizeChoice
              label="Room size"
              size={room.size}
              smallest={room.playerNames.length}
              isEnabled={isOwner}
              onChoose={onChangeSize}
            />
            <p className={styles["small"]}>
              Only the owner can change the size, and not below the number of players already in the
              room.
            </p>
          </div>
          <WaitingPlayers room={room} myName={myName} />
          <p className={styles["small"]}>
            The game starts when the room is full and every player accepts. Share the room code{" "}
            {room.code} with friends.
          </p>
        </section>
      </main>
      {room.asking === null ? null : (
        <AcceptDialog
          asking={room.asking}
          size={room.size}
          myName={myName}
          now={now}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      )}
    </div>
  );
}
