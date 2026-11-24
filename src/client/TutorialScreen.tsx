import type { TutorialView } from "../shared/TutorialView";
import { TutorialPage } from "./screens/tutorial/TutorialPage";
import type { ClientState } from "./store/ClientState";
import type { ClientStore } from "./store/ClientStore";

type Props = {
  readonly store: ClientStore;
  readonly state: ClientState;
  readonly tutorial: TutorialView;
};

export function TutorialScreen({ store, state, tutorial }: Props) {
  return (
    <TutorialPage
      tutorial={tutorial}
      playerName={state.session?.name ?? ""}
      playerIcon={state.tutorialPlayerIcon}
      pendingActions={state.pendingActions}
      rejectedMove={state.rejectedMove}
      connection={state.connection}
      isOutdated={state.isOutdated}
      serverClockOffsetMs={state.serverClockOffsetMs}
      onAction={store.sendTutorialMove}
      onContinue={store.continueTutorial}
      onRestart={store.restartTutorial}
      onLeave={store.leaveTutorial}
      onDismissRejection={store.dismissRejection}
      onPlayHere={store.playTutorialHere}
    />
  );
}
