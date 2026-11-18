import { CurrentScreen } from "./CurrentScreen";
import { TutorialRefusalToast } from "./screens/menu/TutorialRefusalToast";
import { TutorialStart } from "./screens/menu/TutorialStart";
import type { ClientStore } from "./store/ClientStore";

type Props = {
  readonly store: ClientStore;
};

export function TutorialStartingScreen({ store }: Props) {
  return (
    <TutorialStart.Provider value={store.startTutorial}>
      <CurrentScreen store={store} />
      <TutorialRefusalToast store={store} />
    </TutorialStart.Provider>
  );
}
