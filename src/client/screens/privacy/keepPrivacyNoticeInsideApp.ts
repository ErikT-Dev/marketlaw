import { PRIVACY_NOTICE_HASH } from "./PRIVACY_NOTICE_HASH";

export function keepPrivacyNoticeInsideApp(): void {
  if (window.location.hash !== PRIVACY_NOTICE_HASH) {
    return;
  }
  window.history.replaceState(null, "", window.location.pathname);
  window.history.pushState(null, "", `${window.location.pathname}${PRIVACY_NOTICE_HASH}`);
}
