import type { EpochMs } from "../../shared/EpochMs";
import type { Identity } from "./Identity";

export type ConnectionState = {
  readonly identity: Identity | null;
  readonly rejectionTimes: ReadonlyArray<EpochMs>;
};
