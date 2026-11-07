import type { RoomView } from "../../../shared/protocol/RoomView";
import { useServerNow } from "../game/useServerNow";
import { AcceptDialog } from "./AcceptDialog";

type Props = {
  readonly room: RoomView;
  readonly myName: string;
  readonly onAccept: () => void;
  readonly onDecline: () => void;
};

export function RematchDialogIfAsked({ room, myName, onAccept, onDecline }: Props) {
  const now = useServerNow();
  return room.asking === null ? null : (
    <AcceptDialog
      asking={room.asking}
      isRematch={true}
      playerCount={room.namesInRoom.length}
      myName={myName}
      now={now}
      onAccept={onAccept}
      onDecline={onDecline}
    />
  );
}
