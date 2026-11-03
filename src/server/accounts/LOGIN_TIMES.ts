const DAY_MS = 86_400_000;

export const LOGIN_TIMES = {
  recordUseAfterMs: DAY_MS,
  expireAfterMs: 91 * DAY_MS,
} as const;
