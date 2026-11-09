import type { IconText } from "../../components/IconText";
import { Toast } from "../../components/Toast";
import styles from "./Lobby.module.css";

type Props = {
  readonly toast: { readonly title: string; readonly text: IconText } | null;
  readonly onClose: () => void;
};

export function RoomToast({ toast, onClose }: Props) {
  return toast === null ? null : (
    <div className={styles["toastPlace"]}>
      <Toast kind="warning" {...toast} onClose={onClose} />
    </div>
  );
}
