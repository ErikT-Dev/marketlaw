import { useSyncExternalStore } from "react";
import { GamePage } from "./screens/GamePage";
import { ServerClockOffset } from "./screens/game/ServerClockOffset";
import { LobbyPage } from "./screens/lobby/LobbyPage";
import { WaitingRoomPage } from "./screens/lobby/WaitingRoomPage";
import { WaitingPage } from "./screens/WaitingPage";
import type { ClientStore } from "./store/ClientStore";

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
      />
    );
  }
  if (update === null) {
    return <WaitingPage connection={state.connection} />;
  }
  if (update.game === null) {
    return (
      <ServerClockOffset value={state.serverClockOffsetMs}>
        <WaitingRoomPage
          room={update.room}
          myName={session.name}
          onChangeSize={(size) => {
            store.sendRoomAction({ type: "change_size", size });
          }}
          onLeave={store.leaveWaitingRoom}
          onAccept={() => {
            store.sendRoomAction({ type: "accept_game" });
          }}
          onDecline={() => {
            store.sendRoomAction({ type: "decline_game" });
          }}
        />
      </ServerClockOffset>
    );
  }
  return (
    <GamePage
      update={update}
      pendingActions={state.pendingActions}
      rejectedMove={state.rejectedMove}
      onAction={store.sendAction}
      onDismissRejection={store.dismissRejection}
      serverClockOffsetMs={state.serverClockOffsetMs}
      timeOutNotice={state.timeOutNotice}
      onDismissTimeOutNotice={store.dismissTimeOutNotice}
      onExitToLobby={store.exitToLobby}
    />
  );
}
