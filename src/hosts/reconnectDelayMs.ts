const FIRST_RECONNECT_DELAY_MS = 1000;
const LONGEST_RECONNECT_DELAY_MS = 10_000;

export function reconnectDelayMs(failedConnects: number): number {
  return Math.min(FIRST_RECONNECT_DELAY_MS * 2 ** failedConnects, LONGEST_RECONNECT_DELAY_MS);
}
