import { recordPageOf } from "./recordPageOf";

export function keepRecordPageInsideApp(): void {
  const { hash, pathname } = window.location;
  if (recordPageOf(hash) === null) {
    return;
  }
  window.history.replaceState(null, "", pathname);
  window.history.pushState(null, "", `${pathname}${hash}`);
}
