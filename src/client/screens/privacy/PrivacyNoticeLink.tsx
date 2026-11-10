import styles from "./PrivacyNotice.module.css";
import { PRIVACY_NOTICE_HASH } from "./PRIVACY_NOTICE_HASH";

export function PrivacyNoticeLink() {
  return (
    <p className={styles["linkLine"]}>
      What we keep and why:{" "}
      <a className={styles["link"]} href={PRIVACY_NOTICE_HASH}>
        Privacy notice
      </a>
    </p>
  );
}
