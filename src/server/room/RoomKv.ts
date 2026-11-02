export type RoomKv = {
  readonly get: (key: string) => unknown;
  readonly put: (key: string, value: Uint8Array) => void;
  readonly delete: (key: string) => unknown;
};
