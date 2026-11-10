import { useSyncExternalStore } from "react";
import { accountBindingOf } from "./accountBindingOf";
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
        account={session === null ? null : accountBindingOf(store, session, false)}
        joinError={state.joinError}
        removal={state.removal}
        onJoin={(code) => void store.joinRoom(code)}
        onCreate={store.createRoom}
        onStartAsGuest={store.startAsGuest}
        onLogIn={store.logIn}
        onSignUp={store.signUp}
        onForgotPassword={store.openForgotPassword}
        onDismissRemoval={store.dismissRemoval}
        publicRooms={state.publicRooms}
      />
    );
  }
  if (update === null) {
    return <WaitingPage connection={state.connection} />;
  }
  const account = accountBindingOf(
    store,
    session,
    update.game !== null && update.game.view.result === null,
  );
  const { myName } = update.room;
  if (update.game === null) {
    return (
      <WaitingRoomScreen
        store={store}
        state={state}
        room={update.room}
        myName={myName}
        account={account}
      />
    );
  }
  return (
    <RoomGameScreen store={store} state={state} update={update} myName={myName} account={account} />
  );
}
