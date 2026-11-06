import type { RoomView } from "../../../shared/protocol/RoomView";
import type { IconText } from "../../components/IconText";
import { TextWithIcons } from "../../components/TextWithIcons";
import { Toast } from "../../components/Toast";
import { SITE_GAME_LIMIT_TOAST } from "../game/SITE_GAME_LIMIT_TOAST";
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
  readonly rejection: IconText | null;
  readonly hasSiteGameLimitNotice: boolean;
  readonly onDismissSiteGameLimit: () => void;
};

export function WaitingRoomPage(props: Props) {
  const { room, myName, onChangeSize, onLeave, onAccept, onDecline, rejection } = props;
  const now = useServerNow();
  const isOwner = room.ownerName === myName;
  return (
    <div className={styles["page"]}>
      <LobbyTopBar name={myName} />
      <main className={styles["columns"]}>
        <section className={styles["panel"]} aria-labelledby="room-heading">
          <WaitingRoomHeader room={room} isOwner={isOwner} onLeave={onLeave} />
          {rejection === null ? null : (
            <p role="alert" className={styles["error"]}>
              <TextWithIcons text={rejection} />
            </p>
          )}
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
      {props.hasSiteGameLimitNotice ? (
        <div className={styles["toastPlace"]}>
          <Toast kind="warning" {...SITE_GAME_LIMIT_TOAST} onClose={props.onDismissSiteGameLimit} />
        </div>
      ) : null}
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
