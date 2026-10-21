export type RoomConnection = {
  readonly pressCount: number | null;
  readonly isConnected: boolean;
  readonly press: () => void;
};
