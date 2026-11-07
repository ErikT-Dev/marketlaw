export type ReplySocket = {
  readonly send: (message: string) => void;
  readonly serializeAttachment: (attachment: unknown) => void;
  readonly close: (code: number, reason: string) => void;
};
