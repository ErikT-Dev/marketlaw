export type PhotoLoader = {
  readonly decode: (url: string) => Promise<unknown>;
  readonly wait: (milliseconds: number, then: () => void) => () => void;
};
