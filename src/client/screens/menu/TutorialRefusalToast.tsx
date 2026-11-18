import { useSyncExternalStore } from "react";
import { Toast } from "../../components/Toast";
import type { ClientStore } from "../../store/ClientStore";
import { REJECTION_MESSAGES } from "../game/REJECTION_MESSAGES";
import styles from "./GameMenu.module.css";

type Props = {
  readonly store: ClientStore;
};

export function TutorialRefusalToast({ store }: Props) {
  const refusal = useSyncExternalStore(store.subscribe, () => store.getSnapshot().tutorialRefusal);
  return refusal === null ? null : (
    <div className={styles["toastPlace"]}>
      <Toast
        kind="error"
        title="The tutorial did not start"
        text={REJECTION_MESSAGES[refusal]}
        onClose={store.dismissTutorialRefusal}
      />
    </div>
  );
}
