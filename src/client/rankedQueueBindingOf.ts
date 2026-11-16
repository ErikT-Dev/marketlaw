import type { RankedQueueBinding } from "./screens/lobby/RankedQueueBinding";
import type { ClientState } from "./store/ClientState";
import type { ClientStore } from "./store/ClientStore";

export function rankedQueueBindingOf(store: ClientStore, state: ClientState): RankedQueueBinding {
  return {
    queue: state.queue,
    notice: state.queueNotice,
    rejection: state.queueRejection,
    standingCheck: `${state.emailDialog?.kind ?? "none"}:${state.queueRejection ?? "none"}`,
    onIntent: store.sendQueueIntent,
    onResync: store.resyncQueue,
    onDismissNotice: store.dismissQueueNotice,
  };
}
