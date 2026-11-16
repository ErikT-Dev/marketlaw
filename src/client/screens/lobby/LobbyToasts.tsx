import { Toast } from "../../components/Toast";
import type { RemovalNotice } from "../../store/RemovalNotice";
import styles from "./Lobby.module.css";
import { queueNoticeToastOf } from "./queueNoticeToastOf";
import type { RankedQueueBinding } from "./RankedQueueBinding";
import { removalText } from "./removalText";

type Props = {
  readonly removal: RemovalNotice | null;
  readonly ranked: RankedQueueBinding;
  readonly now: number;
  readonly onDismissRemoval: () => void;
};

export function LobbyToasts({ removal, ranked, now, onDismissRemoval }: Props) {
  const queueToast = ranked.notice === null ? null : queueNoticeToastOf(ranked.notice, now);
  if (removal === null && queueToast === null) {
    return null;
  }
  return (
    <div className={styles["toastPlace"]}>
      {removal === null ? null : (
        <Toast
          kind="warning"
          title={`Removed from room ${removal.code}`}
          text={removalText(removal, now)}
          onClose={onDismissRemoval}
        />
      )}
      {queueToast === null ? null : (
        <Toast
          kind="warning"
          title={queueToast.title}
          text={queueToast.text}
          onClose={ranked.onDismissNotice}
        />
      )}
    </div>
  );
}
