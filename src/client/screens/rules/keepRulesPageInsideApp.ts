import { rulesPageOf } from "./rulesPageOf";

export function keepRulesPageInsideApp(): void {
  const { hash, pathname } = window.location;
  if (rulesPageOf(hash) === null) {
    return;
  }
  window.history.replaceState(null, "", pathname);
  window.history.pushState(null, "", `${pathname}${hash}`);
}
