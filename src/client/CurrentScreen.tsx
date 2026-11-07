import { useSyncExternalStore } from "react";
import { chatBindingOf } from "./chatBindingOf";
import { GamePage } from "./screens/GamePage";
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
  return (
    <GamePage
      update={update}
      chat={chatBindingOf(store, state.chat)}
      pendingActions={state.pendingActions}
      rejectedMove={state.rejectedMove}
      onAction={store.sendAction}
      onDismissRejection={store.dismissRejection}
      serverClockOffsetMs={state.serverClockOffsetMs}
      timeOutNotice={state.timeOutNotice}
      onDismissTimeOutNotice={store.dismissTimeOutNotice}
      onExitToLobby={store.exitToLobby}
      connection={state.connection}
      isOutdated={state.isOutdated}
      onPlayHere={store.playHere}
    />
  );
}
