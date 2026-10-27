export type HostSocket = {
  readonly send: (text: string) => void;
  readonly close: () => void;
};
