import { REPLAY_RECORD_KEPT_MS } from "./REPLAY_RECORD_KEPT_MS";

export function replayRecordCutoff(now: number): number {
  return now - REPLAY_RECORD_KEPT_MS;
}
