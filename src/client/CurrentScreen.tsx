import { useSyncExternalStore } from "react";
import { GamePage } from "./screens/GamePage";
import { RoomChoicePage } from "./screens/RoomChoicePage";
import { StartPage } from "./screens/StartPage";
import { WaitingPage } from "./screens/WaitingPage";
import type { ClientStore } from "./store/ClientStore";

type Props = {
  readonly store: ClientStore;
};

export function CurrentScreen({ store }: Props) {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  if (state.session === null) {
    return <StartPage onStart={(name) => void store.startAsGuest(name)} />;
  }
  if (state.session.roomCode === null) {
    return (
      <RoomChoicePage
        name={state.session.name}
        onCreate={(size) => void store.createRoom(size)}
        onJoin={(code) => void store.joinRoom(code)}
      />
    );
  }
  if (state.update?.game === null || state.update === null) {
    return <WaitingPage room={state.update?.room ?? null} connection={state.connection} />;
  }
  return <GamePage update={state.update} onAction={store.sendAction} />;
}
