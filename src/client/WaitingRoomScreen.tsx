import type { RoomView } from "../shared/protocol/RoomView";
import { ServerClockOffset } from "./screens/game/ServerClockOffset";
import { waitingRoomNoticesOf } from "./screens/lobby/waitingRoomNoticesOf";
import { WaitingRoomPage } from "./screens/lobby/WaitingRoomPage";
import type { ClientState } from "./store/ClientState";
import type { ClientStore } from "./store/ClientStore";

type Props = {
  readonly store: ClientStore;
  readonly state: ClientState;
  readonly room: RoomView;
  readonly myName: string;
};

export function WaitingRoomScreen({ store, state, room, myName }: Props) {
  return (
    <ServerClockOffset value={state.serverClockOffsetMs}>
      <WaitingRoomPage
        room={room}
        myName={myName}
        onChangeSize={(size) => {
          store.sendRoomAction({ type: "change_size", size });
        }}
        onLeave={store.leaveWaitingRoom}
        {...waitingRoomNoticesOf(state)}
        onDismissSiteGameLimit={() => {
          store.dismissTimeOutNotice();
          store.dismissRejection();
        }}
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
