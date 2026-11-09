import type { RoomUpdate } from "../shared/protocol/RoomUpdate";
import { chatBindingOf } from "./chatBindingOf";
import { rematchHandlersOf } from "./rematchHandlersOf";
import { GamePage } from "./screens/GamePage";
import { ServerClockOffset } from "./screens/game/ServerClockOffset";
import { RematchDialogIfAsked } from "./screens/lobby/RematchDialogIfAsked";
import type { ClientState } from "./store/ClientState";
import type { ClientStore } from "./store/ClientStore";

type Props = {
  readonly store: ClientStore;
  readonly state: ClientState;
  readonly update: RoomUpdate;
  readonly myName: string;
  readonly onCloseResult: () => void;
};

export function GameScreen({ store, state, update, myName, onCloseResult }: Props) {
  const { room } = update;
  const { onAskRematch, onAccept, onDecline } = rematchHandlersOf(store);
  const canAskRematch = room.namesInRoom.length >= 2 && room.asking === null;
  return (
    <>
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
        onCloseResult={onCloseResult}
        onAskRematch={canAskRematch ? onAskRematch : null}
        connection={state.connection}
        isOutdated={state.isOutdated}
        onPlayHere={store.playHere}
      />
      {update.game?.view.result === null ? null : (
        <ServerClockOffset.Provider value={state.serverClockOffsetMs}>
          <RematchDialogIfAsked
            room={room}
            myName={myName}
            onAccept={onAccept}
            onDecline={onDecline}
          />
        </ServerClockOffset.Provider>
      )}
    </>
  );
}
