export type SocketHandlers = {
  readonly onOpen: () => void;
  readonly onMessage: (text: string) => void;
  readonly onClose: () => void;
};
