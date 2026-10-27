export type HostSocket = {
  readonly send: (text: string) => boolean;
  readonly close: () => void;
};
