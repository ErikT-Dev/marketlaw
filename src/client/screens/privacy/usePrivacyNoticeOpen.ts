import { useSyncExternalStore } from "react";
import { PRIVACY_NOTICE_HASH } from "./PRIVACY_NOTICE_HASH";

function subscribeToHash(onChange: () => void): () => void {
  window.addEventListener("hashchange", onChange);
  return () => {
    window.removeEventListener("hashchange", onChange);
  };
}

function isPrivacyNoticeHash(): boolean {
  return window.location.hash === PRIVACY_NOTICE_HASH;
}

export function usePrivacyNoticeOpen(): boolean {
  return useSyncExternalStore(subscribeToHash, isPrivacyNoticeHash);
}
