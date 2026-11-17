import type { GameResult } from "../shared/GameResult";
import type { PlayerView } from "../shared/PlayerView";
import type { RoomView } from "../shared/protocol/RoomView";
import type { AccountBinding } from "./screens/account/AccountBinding";
import { chatBindingOf } from "./chatBindingOf";
import { rematchHandlersOf } from "./rematchHandlersOf";
import { ServerClockOffset } from "./screens/game/ServerClockOffset";
import { afterGameNoticesOf } from "./screens/lobby/afterGameNoticesOf";
import { RoomAfterGamePage } from "./screens/lobby/RoomAfterGamePage";
import type { ClientState } from "./store/ClientState";
import type { ClientStore } from "./store/ClientStore";

type Props = {
  readonly store: ClientStore;
  readonly state: ClientState;
  readonly room: RoomView;
  readonly view: PlayerView;
  readonly result: GameResult;
  readonly myName: string;
  readonly account: AccountBinding;
};

export function RoomAfterGameScreen(props: Props) {
  const { store, state, room, view, result, myName, account } = props;
  return (
    <ServerClockOffset.Provider value={state.serverClockOffsetMs}>
      <RoomAfterGamePage
        room={room}
        myName={myName}
        account={account}
        result={result}
        turn={view.turn}
        viewer={view.seat}
        chat={chatBindingOf(store, state.chat)}
        playersOnline={state.playersOnline}
        {...afterGameNoticesOf(state, view.seat, room.playerNames)}
        onDismissToast={() => {
          store.dismissTimeOutNotice();
          store.dismissRejection();
        }}
        onLeave={store.leaveWaitingRoom}
        {...rematchHandlersOf(store)}
      />
    </ServerClockOffset.Provider>
  );
}
