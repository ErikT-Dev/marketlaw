import type { PublicRoomView } from "../../../shared/protocol/PublicRoomView";
import type { IconText } from "../../components/IconText";
import { JoinWithCode } from "./JoinWithCode";
import styles from "./Lobby.module.css";
import { PublicRoomsList } from "./PublicRoomsList";

type Props = {
  readonly rooms: ReadonlyArray<PublicRoomView>;
  readonly joinError: IconText | null;
  readonly isBusy: boolean;
  readonly onJoin: (code: string) => void;
  readonly onCreate: () => void;
};

export function PublicRoomsPanel({ rooms, joinError, isBusy, onJoin, onCreate }: Props) {
  return (
    <section className={styles["panel"]} aria-labelledby="rooms-heading">
      <div className={styles["panelHeader"]}>
        <h2 id="rooms-heading" className={styles["panelTitle"]}>
          Public rooms · {rooms.length}
        </h2>
        <JoinWithCode error={joinError} onJoin={onJoin} onCreate={onCreate} isBusy={isBusy} />
      </div>
      <PublicRoomsList rooms={rooms} onJoin={onJoin} isBusy={isBusy} />
    </section>
  );
}
