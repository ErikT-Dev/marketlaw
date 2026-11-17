import { useSyncExternalStore } from "react";
import styles from "./App.module.css";
import { CurrentScreen } from "./CurrentScreen";
import { LazyCardSetPage } from "./screens/cardSet/LazyCardSetPage";
import { useCardSetOpen } from "./screens/cardSet/useCardSetOpen";
import { EmailDialogIfOpen } from "./screens/email/EmailDialogIfOpen";
import { LazyPrivacyNoticePage } from "./screens/privacy/LazyPrivacyNoticePage";
import { usePrivacyNoticeOpen } from "./screens/privacy/usePrivacyNoticeOpen";
import { LazyRecordsPage } from "./screens/records/LazyRecordsPage";
import { useRecordPage } from "./screens/records/useRecordPage";
import { runningGameClockOf } from "./screens/game/runningGameClockOf";
import { LazyRulesPage } from "./screens/rules/LazyRulesPage";
import { useRulesPage } from "./screens/rules/useRulesPage";
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
  const viewerId = useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot().session?.playerId ?? null,
  );
  const token = useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot().session?.token ?? null,
  );
  const update = useSyncExternalStore(store.subscribe, () => store.getSnapshot().update);
  const serverClockOffsetMs = useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot().serverClockOffsetMs,
  );
  const isPrivacyNoticeOpen = usePrivacyNoticeOpen();
  const recordPage = useRecordPage();
  const rulesPage = useRulesPage();
  const isCardSetOpen = useCardSetOpen();
  const gameClock = runningGameClockOf(update, serverClockOffsetMs);
  return (
    <>
      <p className={styles["tooSmall"]}>
        Please use a larger screen: MarketLaw needs at least 1280 pixels of width.
      </p>
      <div
        className={styles["app"]}
        inert={isPrivacyNoticeOpen || recordPage !== null || rulesPage !== null || isCardSetOpen}
      >
        {notice === null ? null : (
          <p role="alert" className={styles["notice"]}>
            {notice}
          </p>
        )}
        <CurrentScreen store={store} />
        {goneRoomCode === null ? null : <RoomNotFoundDialog onClose={store.dismissRemoval} />}
        <EmailDialogIfOpen store={store} />
      </div>
      {isPrivacyNoticeOpen ? <LazyPrivacyNoticePage /> : null}
      {rulesPage === null ? null : <LazyRulesPage address={rulesPage} gameClock={gameClock} />}
      {isCardSetOpen ? <LazyCardSetPage gameClock={gameClock} /> : null}
      {recordPage === null ? null : (
        <LazyRecordsPage
          key={window.location.hash}
          page={recordPage}
          viewerId={viewerId}
          token={token}
        />
      )}
    </>
  );
}
