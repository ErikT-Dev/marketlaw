import { Button } from "../../components/Button";
import styles from "./Lobby.module.css";

type Props = {
  readonly submitLabel: string;
  readonly sendingLabel: string | null;
  readonly isDisabled: boolean;
  readonly onCancel: () => void;
};

export function DialogButtons({ submitLabel, sendingLabel, isDisabled, onCancel }: Props) {
  return (
    <div className={styles["dialogButtons"]}>
      <Button look="secondary" onClick={onCancel}>
        Cancel
      </Button>
      <Button look="primary" isSubmit isDisabled={isDisabled} loadingLabel={sendingLabel}>
        {submitLabel}
      </Button>
    </div>
  );
}
