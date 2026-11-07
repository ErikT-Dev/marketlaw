import { useSyncExternalStore } from "react";
import { RoomGameScreen } from "./RoomGameScreen";
import { LobbyPage } from "./screens/lobby/LobbyPage";
import { WaitingPage } from "./screens/WaitingPage";
import type { ClientStore } from "./store/ClientStore";
import { WaitingRoomScreen } from "./WaitingRoomScreen";

type Props = {
  readonly store: ClientStore;
};

export function CurrentScreen({ store }: Props) {
  const state = useSyncExternalStore(store.subscribe, store.getSnapshot);
  const { session, update } = state;
  if (session?.roomCode === null || session === null) {
    return (
      <LobbyPage
        name={session?.name ?? null}
        joinError={state.joinError}
        removal={state.removal}
        onJoin={(code) => void store.joinRoom(code)}
        onCreate={store.createRoom}
        onStartAsGuest={store.startAsGuest}
        onDismissRemoval={store.dismissRemoval}
        publicRooms={state.publicRooms}
      />
    );
  }
  if (update === null) {
    return <WaitingPage connection={state.connection} />;
  }
  if (update.game === null) {
    return (
      <WaitingRoomScreen store={store} state={state} room={update.room} myName={session.name} />
    );
  }
  return <RoomGameScreen store={store} state={state} update={update} myName={session.name} />;
}
