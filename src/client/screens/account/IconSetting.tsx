import { useState } from "react";
import type { UsernameWait } from "../../../shared/api/UsernameWait";
import type { PlayerIconChoice } from "../../../shared/playerIcons/PlayerIconChoice";
import type { ReasonCode } from "../../../shared/ReasonCode";
import { Button } from "../../components/Button";
import { PlayerIcon } from "../../components/PlayerIcon";
import styles from "./Account.module.css";
import { IconPicker } from "./IconPicker";
import pickerStyles from "./IconPicker.module.css";

type Props = {
  readonly icon: PlayerIconChoice | null;
  readonly wait: UsernameWait | null;
  readonly onChangeIcon: (icon: PlayerIconChoice) => Promise<ReasonCode | null>;
  readonly onChanged: () => Promise<void>;
};

export function IconSetting({ icon, wait, onChangeIcon, onChanged }: Props) {
  const [isPicking, setIsPicking] = useState(false);
  return (
    <section className={styles["setting"]} aria-labelledby="icon-setting-heading">
      <h3 id="icon-setting-heading" className={styles["settingTitle"]}>
        Player icon
      </h3>
      <div className={pickerStyles["current"]}>
        <PlayerIcon name="You" icon={icon} />
        <Button
          look="secondary"
          isDisabled={icon === null}
          onClick={() => {
            setIsPicking(!isPicking);
          }}
        >
          Change icon
        </Button>
      </div>
      {isPicking && icon !== null ? (
        <IconPicker
          icon={icon}
          wait={wait}
          onChangeIcon={onChangeIcon}
          onSaved={async () => {
            setIsPicking(false);
            await onChanged();
          }}
        />
      ) : null}
    </section>
  );
}
