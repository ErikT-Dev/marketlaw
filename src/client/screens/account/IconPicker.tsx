import { useState } from "react";
import type { UsernameWait } from "../../../shared/api/UsernameWait";
import { areIconColorsTooAlike } from "../../../shared/playerIcons/areIconColorsTooAlike";
import { PLAYER_ICON_PICTURES } from "../../../shared/playerIcons/PLAYER_ICON_PICTURES";
import type { PlayerIconChoice } from "../../../shared/playerIcons/PlayerIconChoice";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { Button } from "../../components/Button";
import { TextWithIcons } from "../../components/TextWithIcons";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";
import { IconColors } from "./IconColors";
import { IconPictureButton } from "./IconPictureButton";
import styles from "./IconPicker.module.css";
import { iconHintOf } from "./iconHintOf";

type Props = {
  readonly icon: PlayerIconChoice;
  readonly wait: UsernameWait | null;
  readonly onChangeIcon: (icon: PlayerIconChoice) => Promise<ReasonCode | null>;
  readonly onSaved: () => Promise<void>;
};

function isSameIcon(first: PlayerIconChoice, second: PlayerIconChoice): boolean {
  return (
    first.picture === second.picture &&
    first.background.toLowerCase() === second.background.toLowerCase() &&
    first.color.toLowerCase() === second.color.toLowerCase()
  );
}

export function IconPicker({ icon, wait, onChangeIcon, onSaved }: Props) {
  const [choice, setChoice] = useState(icon);
  const [problem, setProblem] = useState<ReasonCode | null>(null);
  const [isSending, setIsSending] = useState(false);
  const isTooAlike = areIconColorsTooAlike(choice.background, choice.color);
  async function save() {
    setIsSending(true);
    const answer = await onChangeIcon(choice);
    setProblem(answer);
    setIsSending(false);
    if (answer === null) {
      await onSaved();
    }
  }
  const message = isTooAlike ? "icon_colors_too_alike" : problem;
  return (
    <form
      className={styles["picker"]}
      aria-label="Change icon"
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div className={styles["pictures"]} role="group" aria-label="Pictures">
        {PLAYER_ICON_PICTURES.map((picture) => (
          <IconPictureButton
            key={picture}
            icon={{ ...choice, picture }}
            isChosen={picture === choice.picture}
            onChoose={() => {
              setChoice({ ...choice, picture });
            }}
          />
        ))}
      </div>
      <IconColors choice={choice} onChange={setChoice} />
      <p className={message === null ? styles["hint"] : styles["error"]} role="status">
        <TextWithIcons text={message === null ? iconHintOf(wait) : REJECTION_MESSAGES[message]} />
      </p>
      <div>
        <Button
          look="primary"
          isSubmit
          isDisabled={isTooAlike || wait !== null || isSameIcon(choice, icon)}
          loadingLabel={isSending ? "Saving" : null}
        >
          Save
        </Button>
      </div>
    </form>
  );
}
