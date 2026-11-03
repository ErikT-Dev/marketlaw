import type { ConnectionAttachment } from "./ConnectionAttachment";

export const NO_CONNECTION: ConnectionAttachment = {
  identity: null,
  tokenHash: null,
  rejectionTimes: [],
};
