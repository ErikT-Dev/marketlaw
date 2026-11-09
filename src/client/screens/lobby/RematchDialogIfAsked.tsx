import type { RoomView } from "../../../shared/protocol/RoomView";
import { useServerNow } from "../game/useServerNow";
import { AcceptDialog } from "./AcceptDialog";

type Props = {
  readonly room: RoomView;
  readonly onAccept: () => void;
  readonly onDecline: () => void;
};

export function RematchDialogIfAsked({ room, onAccept, onDecline }: Props) {
  const now = useServerNow();
  return room.asking === null ? null : (
    <AcceptDialog
      asking={room.asking}
      isRematch={true}
      playerCount={room.namesInRoom.length}
      now={now}
      onAccept={onAccept}
      onDecline={onDecline}
    />
  );
}
