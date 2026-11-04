import { useSyncExternalStore } from "react";
import styles from "./App.module.css";
import { CurrentScreen } from "./CurrentScreen";
import { RoomNotFoundDialog } from "./screens/lobby/RoomNotFoundDialog";
import type { ClientStore } from "./store/ClientStore";

type Props = {
  readonly store: ClientStore;
};

export function App({ store }: Props) {
  const notice = useSyncExternalStore(store.subscribe, () => store.getSnapshot().notice);
  const goneRoomCode = useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot().goneRoomCode,
  );
  return (
    <>
      <p className={styles["tooSmall"]}>
        Please use a larger screen: MarketLaw needs at least 1280 pixels of width.
      </p>
      <div className={styles["app"]}>
        {notice === null ? null : (
          <p role="alert" className={styles["notice"]}>
            {notice}
          </p>
        )}
        <CurrentScreen store={store} />
        {goneRoomCode === null ? null : <RoomNotFoundDialog onClose={store.dismissRemoval} />}
      </div>
    </>
  );
}
