import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { ConnectionNotices } from "../game/ConnectionNotices";
import { GameToasts } from "../game/GameToasts";
import type { TutorialPageProps } from "./TutorialPageProps";

type Props = TutorialPageProps & {
  readonly view: PlayerView;
  readonly mine: OwnSeatView;
  readonly playerNames: ReadonlyArray<string>;
};

export function TutorialNotices(props: Props) {
  return (
    <>
      <GameToasts
        view={props.view}
        seat={props.mine}
        playerNames={props.playerNames}
        timeOutNotice={null}
        rejectedMove={props.rejectedMove}
        onDismissTimeOutNotice={props.onDismissRejection}
        onDismissRejection={props.onDismissRejection}
      />
      <ConnectionNotices
        connection={props.connection}
        isOutdated={props.isOutdated}
        isStillPlaying={false}
        onPlayHere={props.onPlayHere}
      />
    </>
  );
}
