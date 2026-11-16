import type { LoginRequest } from "../../../shared/api/LoginRequest";
import type { SignupRequest } from "../../../shared/api/SignupRequest";
import type { PublicRoomView } from "../../../shared/protocol/PublicRoomView";
import type { ReasonCode } from "../../../shared/ReasonCode";
import type { AccountBinding } from "../account/AccountBinding";
import type { JoinError } from "../../store/JoinError";
import type { NewRoom } from "../../store/NewRoom";
import type { RemovalNotice } from "../../store/RemovalNotice";
import { useServerNow } from "../game/useServerNow";
import { CreateRoomDialog } from "./CreateRoomDialog";
import { GuestNameDialog } from "./GuestNameDialog";
import { joinErrorText } from "./joinErrorText";
import { JoinWithCode } from "./JoinWithCode";
import styles from "./Lobby.module.css";
import { LobbyAccount } from "./LobbyAccount";
import { PublicRoomsList } from "./PublicRoomsList";
import { LobbyToasts } from "./LobbyToasts";
import type { RankedQueueBinding } from "./RankedQueueBinding";
import { RankedQueueSection } from "./RankedQueueSection";
import { useLobbyFlow } from "./useLobbyFlow";

type Props = {
  readonly account: AccountBinding | null;
  readonly joinError: JoinError | null;
  readonly removal: RemovalNotice | null;
  readonly onJoin: (code: string) => void;
  readonly onCreate: (room: NewRoom) => Promise<ReasonCode | null>;
  readonly onStartAsGuest: (name: string, humanCheck: string) => Promise<ReasonCode | null>;
  readonly onLogIn: (login: LoginRequest) => Promise<ReasonCode | null>;
  readonly onSignUp: (signup: Omit<SignupRequest, "token">) => Promise<ReasonCode | null>;
  readonly onForgotPassword: () => void;
  readonly onDismissRemoval: () => void;
  readonly publicRooms: ReadonlyArray<PublicRoomView>;
  readonly ranked: RankedQueueBinding;
};

export function LobbyPage(props: Props) {
  const { account, joinError, removal, onJoin, onCreate, onStartAsGuest, onDismissRemoval } = props;
  const { publicRooms, ranked } = props;
  const isBusy = ranked.queue !== null && ranked.queue.own.kind !== "out";
  const now = useServerNow();
  const flow = useLobbyFlow(account !== null, onJoin);
  return (
    <div className={styles["page"]}>
      <LobbyAccount
        account={account}
        onLogIn={props.onLogIn}
        onSignUp={props.onSignUp}
        onForgotPassword={props.onForgotPassword}
      />
      <main className={`${styles["columns"] ?? ""} ${styles["rankedColumns"] ?? ""}`}>
        <section className={styles["panel"]} aria-labelledby="rooms-heading">
          <div className={styles["panelHeader"]}>
            <h2 id="rooms-heading" className={styles["panelTitle"]}>
              Public rooms · {publicRooms.length}
            </h2>
            <JoinWithCode
              error={joinError === null ? null : joinErrorText(joinError, now)}
              onJoin={(code) => void flow.start({ kind: "join", code })}
              onCreate={() => void flow.start({ kind: "create" })}
              isBusy={isBusy}
            />
          </div>
          <PublicRoomsList
            rooms={publicRooms}
            onJoin={(code) => void flow.start({ kind: "join", code })}
            isBusy={isBusy}
          />
        </section>
        <RankedQueueSection account={account} ranked={ranked} now={now} />
      </main>
      <LobbyToasts
        removal={removal}
        ranked={ranked}
        now={now}
        onDismissRemoval={onDismissRemoval}
      />
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
