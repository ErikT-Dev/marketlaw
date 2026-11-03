import type { ConnectionStatus } from "../../../shared/ConnectionStatus";
import type { Notice } from "../../../shared/Notice";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { RejectedMove } from "../../store/RejectedMove";
import { ConnectionNotices } from "./ConnectionNotices";
import { GameToasts } from "./GameToasts";

type Props = {
  readonly seat: OwnSeatView;
  readonly playerNames: ReadonlyArray<string>;
  readonly timeOutNotice: Notice | null;
  readonly rejectedMove: RejectedMove | null;
  readonly onDismissTimeOutNotice: () => void;
  readonly onDismissRejection: () => void;
  readonly connection: ConnectionStatus;
  readonly isOutdated: boolean;
  readonly onPlayHere: () => void;
};

export function GameNotices(props: Props) {
  return (
    <>
      <GameToasts
        seat={props.seat}
        playerNames={props.playerNames}
        timeOutNotice={props.timeOutNotice}
        rejectedMove={props.rejectedMove}
        onDismissTimeOutNotice={props.onDismissTimeOutNotice}
        onDismissRejection={props.onDismissRejection}
      />
      <ConnectionNotices
        connection={props.connection}
        isOutdated={props.isOutdated}
        onPlayHere={props.onPlayHere}
      />
    </>
  );
}
