import { useState } from "react";
import type { RoomUpdate } from "../shared/protocol/RoomUpdate";
import type { AccountBinding } from "./screens/account/AccountBinding";
import { GameScreen } from "./GameScreen";
import { RoomAfterGameScreen } from "./RoomAfterGameScreen";
import type { ClientState } from "./store/ClientState";
import type { ClientStore } from "./store/ClientStore";

type Props = {
  readonly store: ClientStore;
  readonly state: ClientState;
  readonly update: RoomUpdate;
  readonly myName: string;
  readonly account: AccountBinding;
};

export function RoomGameScreen({ store, state, update, myName, account }: Props) {
  const [isResultClosed, setIsResultClosed] = useState(false);
  const view = update.game?.view ?? null;
  const result = view?.result ?? null;
  if (result === null && isResultClosed) {
    setIsResultClosed(false);
  }
  if (view !== null && result !== null && isResultClosed) {
    return (
      <RoomAfterGameScreen
        store={store}
        state={state}
        room={update.room}
        view={view}
        result={result}
        myName={myName}
        account={account}
      />
    );
  }
  return (
    <GameScreen
      store={store}
      state={state}
      update={update}
      account={account}
      onCloseResult={() => {
        setIsResultClosed(true);
      }}
    />
  );
}
