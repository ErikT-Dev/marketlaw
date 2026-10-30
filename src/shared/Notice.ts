export type Notice = {
  readonly kind: "timed_out";
  readonly inARow: number;
  readonly of: number;
};
