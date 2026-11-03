import type { ConnectionStatus } from "../../../shared/ConnectionStatus";
import { Button } from "../../components/Button";
import { Modal } from "../../components/Modal";
import styles from "./GamePage.module.css";

type Props = {
  readonly connection: ConnectionStatus;
  readonly isOutdated: boolean;
  readonly onPlayHere: () => void;
};

export function ConnectionNotices({ connection, isOutdated, onPlayHere }: Props) {
  if (isOutdated) {
    return (
      <Modal title="A new version is available" size="large">
        <p>MarketLaw was updated. Reload the page to keep playing; your game and seat are kept.</p>
        <Button
          look="primary"
          onClick={() => {
            window.location.reload();
          }}
        >
          Reload
        </Button>
      </Modal>
    );
  }
  if (connection === "opened_elsewhere") {
    return (
      <Modal title="This game is open in another tab" size="large">
        <p>You can only play a game in one tab at a time.</p>
        <Button look="primary" onClick={onPlayHere}>
          Play here instead
        </Button>
      </Modal>
    );
  }
  return connection === "open" ? null : (
    <p role="status" className={styles["connectionLost"]}>
      Connection lost. Reconnecting… Your clock keeps running; other players see you as away.
    </p>
  );
}
