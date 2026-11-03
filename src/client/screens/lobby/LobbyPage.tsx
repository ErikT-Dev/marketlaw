import type { PublicRoomView } from "../../../shared/protocol/PublicRoomView";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { Toast } from "../../components/Toast";
import type { JoinError } from "../../store/JoinError";
import type { NewRoom } from "../../store/NewRoom";
import type { RemovalNotice } from "../../store/RemovalNotice";
import { useServerNow } from "../game/useServerNow";
import { CreateRoomDialog } from "./CreateRoomDialog";
import { GuestNameDialog } from "./GuestNameDialog";
import { joinErrorText } from "./joinErrorText";
import { JoinWithCode } from "./JoinWithCode";
import styles from "./Lobby.module.css";
import { LobbyTopBar } from "./LobbyTopBar";
import { removalText } from "./removalText";
import { PublicRoomsList } from "./PublicRoomsList";
import { useLobbyFlow } from "./useLobbyFlow";

type Props = {
  readonly name: string | null;
  readonly joinError: JoinError | null;
  readonly removal: RemovalNotice | null;
  readonly onJoin: (code: string) => void;
  readonly onCreate: (room: NewRoom) => Promise<ReasonCode | null>;
  readonly onStartAsGuest: (name: string, humanCheck: string) => Promise<ReasonCode | null>;
  readonly onDismissRemoval: () => void;
  readonly publicRooms: ReadonlyArray<PublicRoomView>;
};

export function LobbyPage(props: Props) {
  const { name, joinError, removal, onJoin, onCreate, onStartAsGuest, onDismissRemoval } = props;
  const { publicRooms } = props;
  const now = useServerNow();
  const flow = useLobbyFlow(name !== null, onJoin);
  return (
    <div className={styles["page"]}>
      <LobbyTopBar name={name} />
      <main className={styles["columns"]}>
        <section className={styles["panel"]} aria-labelledby="rooms-heading">
          <div className={styles["panelHeader"]}>
            <h2 id="rooms-heading" className={styles["panelTitle"]}>
              Public rooms · {publicRooms.length}
            </h2>
            <JoinWithCode
              error={joinError === null ? null : joinErrorText(joinError, now)}
              onJoin={(code) => void flow.start({ kind: "join", code })}
              onCreate={() => void flow.start({ kind: "create" })}
            />
          </div>
          <PublicRoomsList
            rooms={publicRooms}
            onJoin={(code) => void flow.start({ kind: "join", code })}
          />
        </section>
      </main>
      {removal === null ? null : (
        <div className={styles["toastPlace"]}>
          <Toast
            kind="warning"
            title={`Removed from room ${removal.code}`}
            text={removalText(removal, now)}
            onClose={onDismissRemoval}
          />
        </div>
      )}
      {flow.guestPrompt === null ? null : (
        <GuestNameDialog
          generatedName={flow.guestPrompt.generatedName}
          onCancel={flow.closeDialogs}
          onSubmit={async (chosen, humanCheck) => {
            const problem = await onStartAsGuest(chosen, humanCheck);
            if (problem === null) {
              flow.continueAfterGuest();
            }
            return problem;
          }}
        />
      )}
      {flow.isCreateOpen ? (
        <CreateRoomDialog onCreate={onCreate} onCancel={flow.closeDialogs} />
      ) : null}
    </div>
  );
}
