import { useState } from "react";
import type { GameResult } from "../../../shared/GameResult";
import type { RoomView } from "../../../shared/protocol/RoomView";
import type { SeatNumber } from "../../../shared/SeatNumber";
import { Button } from "../../components/Button";
import type { IconText } from "../../components/IconText";
import type { ChatBinding } from "../chat/ChatBinding";
import { GameOverDialog } from "../game/GameOverDialog";
import { playerNameOf } from "../game/playerNameOf";
import { useServerNow } from "../game/useServerNow";
import { afterGameResultLine } from "./afterGameResultLine";
import styles from "./Lobby.module.css";
import { RematchDialogIfAsked } from "./RematchDialogIfAsked";
import { roomDeletionText } from "./roomDeletionText";
import { RoomPageFrame } from "./RoomPageFrame";
import type { AccountBinding } from "../account/AccountBinding";
import { RoomRejectionAlert } from "./RoomRejectionAlert";
import { RoomToast } from "./RoomToast";
import { WaitingPlayers } from "./WaitingPlayers";
import { WaitingRoomHeader } from "./WaitingRoomHeader";

type Props = {
  readonly room: RoomView;
  readonly myName: string;
  readonly account: AccountBinding;
  readonly result: GameResult;
  readonly turn: number;
  readonly viewer: SeatNumber;
  readonly chat: ChatBinding;
  readonly rejection: IconText | null;
  readonly toast: { readonly title: string; readonly text: IconText } | null;
  readonly onDismissToast: () => void;
  readonly onLeave: () => void;
  readonly onAskRematch: () => void;
  readonly onAccept: () => void;
  readonly onDecline: () => void;
};

export function RoomAfterGamePage(props: Props) {
  const { room, myName, result, viewer } = props;
  const [isResultShown, setIsResultShown] = useState(false);
  const now = useServerNow();
  const canAskRematch = room.namesInRoom.length >= 2 && room.asking === null;
  const overlay = (
    <>
      <RoomToast toast={props.toast} onClose={props.onDismissToast} />
      {isResultShown ? (
        <GameOverDialog
          result={result}
          turn={props.turn}
          viewer={viewer}
          playerNames={room.playerNames}
          onExitToLobby={props.onLeave}
          onClose={() => {
            setIsResultShown(false);
          }}
          onAskRematch={canAskRematch ? props.onAskRematch : null}
        />
      ) : null}
      <RematchDialogIfAsked room={room} onAccept={props.onAccept} onDecline={props.onDecline} />
    </>
  );
  const resultLine = (
    <p className={styles["resultLine"]}>
      {afterGameResultLine(result, (seat) => playerNameOf(room.playerNames, seat), viewer)}
      <Button
        look="secondary"
        onClick={() => {
          setIsResultShown(true);
        }}
      >
        Show result
      </Button>
    </p>
  );
  return (
    <RoomPageFrame account={props.account} chat={props.chat} overlay={overlay}>
      <WaitingRoomHeader room={room} subtitle={resultLine} onLeave={props.onLeave}>
        <Button look="primary" onClick={props.onAskRematch} isDisabled={!canAskRematch}>
          Ask for a rematch
        </Button>
      </WaitingRoomHeader>
      <RoomRejectionAlert rejection={props.rejection} />
      <WaitingPlayers room={room} myName={myName} isAfterGame={true} />
      <p className={styles["small"]}>
        You can keep chatting here. Any player can ask for a rematch while at least 2 players are in
        the room. {roomDeletionText(room.deletionAt, now)}
      </p>
    </RoomPageFrame>
  );
}
