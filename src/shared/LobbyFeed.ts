export type LobbyFeed = {
  readonly identify: (token: string) => boolean;
  readonly close: () => void;
};
