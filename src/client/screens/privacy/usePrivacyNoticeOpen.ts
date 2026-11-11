import { useSyncExternalStore } from "react";
import { subscribeToHash } from "../../components/subscribeToHash";
import { PRIVACY_NOTICE_HASH } from "./PRIVACY_NOTICE_HASH";

function isPrivacyNoticeHash(): boolean {
  return window.location.hash === PRIVACY_NOTICE_HASH;
}

export function usePrivacyNoticeOpen(): boolean {
  return useSyncExternalStore(subscribeToHash, isPrivacyNoticeHash);
}
