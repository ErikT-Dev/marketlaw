import type { RoomView } from "../../../shared/protocol/RoomView";
import { Button } from "../../components/Button";
import type { IconText } from "../../components/IconText";
import type { ChatBinding } from "../chat/ChatBinding";
import { SITE_GAME_LIMIT_TOAST } from "../game/SITE_GAME_LIMIT_TOAST";
import { useServerNow } from "../game/useServerNow";
import { AcceptDialog } from "./AcceptDialog";
import styles from "./Lobby.module.css";
import { RoomPageFrame } from "./RoomPageFrame";
import type { AccountBinding } from "../account/AccountBinding";
import { RoomRejectionAlert } from "./RoomRejectionAlert";
import { RoomSizeChoice } from "./RoomSizeChoice";
import { RoomToast } from "./RoomToast";
import { WaitingPlayers } from "./WaitingPlayers";
import { WaitingRoomHeader } from "./WaitingRoomHeader";

type Props = {
  readonly room: RoomView;
  readonly myName: string;
  readonly account: AccountBinding;
  readonly onChangeSize: (size: 2 | 3 | 4) => void;
  readonly onLeave: () => void;
  readonly onAccept: () => void;
  readonly onDecline: () => void;
  readonly rejection: IconText | null;
  readonly hasSiteGameLimitNotice: boolean;
  readonly onDismissSiteGameLimit: () => void;
  readonly chat: ChatBinding;
};

export function WaitingRoomPage(props: Props) {
  const { room, myName, onChangeSize, onLeave, onAccept, onDecline, rejection } = props;
  const now = useServerNow();
  const isOwner = room.ownerName === myName;
  const kind = room.isPublic ? "Public room" : "Private room";
  const overlay = (
    <>
      <RoomToast
        toast={props.hasSiteGameLimitNotice ? SITE_GAME_LIMIT_TOAST : null}
        onClose={props.onDismissSiteGameLimit}
      />
      {room.asking === null ? null : (
        <AcceptDialog
          asking={room.asking}
          isRematch={false}
          playerCount={room.size}
          myName={myName}
          now={now}
          onAccept={onAccept}
          onDecline={onDecline}
        />
      )}
    </>
  );
  return (
    <RoomPageFrame account={props.account} chat={props.chat} overlay={overlay}>
      <WaitingRoomHeader
        room={room}
        subtitle={`${kind} · ${isOwner ? "you are the owner" : `owner: ${room.ownerName}`}`}
        onLeave={onLeave}
      >
        <Button look="secondary" onClick={() => void navigator.clipboard.writeText(room.code)}>
          Copy room code
        </Button>
      </WaitingRoomHeader>
      <RoomRejectionAlert rejection={rejection} />
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
      <WaitingPlayers room={room} myName={myName} isAfterGame={false} />
      <p className={styles["small"]}>
        The game starts when the room is full and every player accepts. Share the room code{" "}
        {room.code} with friends.
      </p>
    </RoomPageFrame>
  );
}
