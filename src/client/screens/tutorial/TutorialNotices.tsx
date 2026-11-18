import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { Toast } from "../../components/Toast";
import { ConnectionNotices } from "../game/ConnectionNotices";
import { GameToasts } from "../game/GameToasts";
import { notThisStepText } from "./notThisStepText";
import type { TutorialPageProps } from "./TutorialPageProps";

type Props = TutorialPageProps & {
  readonly view: PlayerView;
  readonly mine: OwnSeatView;
  readonly playerNames: ReadonlyArray<string>;
};

export function TutorialNotices(props: Props) {
  const { progress } = props.tutorial;
  const isNotThisStep = props.rejectedMove?.code === "not_this_step" && progress.kind === "step";
  return (
    <>
      <GameToasts
        view={props.view}
        seat={props.mine}
        playerNames={props.playerNames}
        timeOutNotice={null}
        rejectedMove={isNotThisStep ? null : props.rejectedMove}
        onDismissTimeOutNotice={props.onDismissRejection}
        onDismissRejection={props.onDismissRejection}
      >
        {isNotThisStep ? (
          <Toast
            kind="info"
            title="Not this step"
            text={notThisStepText(progress.step)}
            onClose={props.onDismissRejection}
          />
        ) : null}
      </GameToasts>
      <ConnectionNotices
        connection={props.connection}
        isOutdated={props.isOutdated}
        isStillPlaying={false}
        onPlayHere={props.onPlayHere}
      />
    </>
  );
}
