import { useState } from "react";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { Modal } from "../../components/Modal";
import { TextWithIcons } from "../../components/TextWithIcons";
import type { NewRoom } from "../../store/NewRoom";
import { DialogButtons } from "./DialogButtons";
import { HumanCheck } from "./HumanCheck";
import styles from "./Lobby.module.css";
import { RoomSizeChoice } from "./RoomSizeChoice";
import { useSubmitWithHumanCheck } from "./useSubmitWithHumanCheck";

type Props = {
  readonly onCreate: (room: NewRoom) => Promise<ReasonCode | null>;
  readonly onCancel: () => void;
};

export function CreateRoomDialog({ onCreate, onCancel }: Props) {
  const [isPublic, setIsPublic] = useState(true);
  const [size, setSize] = useState<2 | 3 | 4>(4);
  const { containerRef, humanCheckToken, isUnavailable, error, isSending, submit } =
    useSubmitWithHumanCheck();
  return (
    <Modal title="Create a room" size="large" onClose={onCancel}>
      <form
        className={styles["dialogBody"]}
        onSubmit={(event) => {
          event.preventDefault();
          void submit(async (humanCheck) => onCreate({ size, isPublic, humanCheck }));
        }}
      >
        <label className={styles["switchRow"]}>
          <input
            type="checkbox"
            role="switch"
            className={styles["switch"]}
            checked={isPublic}
            onChange={(event) => {
              setIsPublic(event.target.checked);
            }}
          />
          Public room: listed in the lobby, anyone can join
        </label>
        <p className={styles["small"]}>Private rooms can only be joined with the room code.</p>
        <RoomSizeChoice
          label="Number of players"
          size={size}
          smallest={2}
          isEnabled
          onChoose={setSize}
        />
        <HumanCheck containerRef={containerRef} isUnavailable={isUnavailable} />
        {error === null ? null : (
          <p role="alert" className={styles["error"]}>
            <TextWithIcons text={error} />
          </p>
        )}
        <DialogButtons
          submitLabel="Create room"
          sendingLabel={isSending ? "Creating" : null}
          isDisabled={humanCheckToken === ""}
          onCancel={onCancel}
        />
      </form>
    </Modal>
  );
}
