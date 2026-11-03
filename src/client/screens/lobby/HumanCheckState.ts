import type { RefObject } from "react";

export type HumanCheckState = {
  readonly containerRef: RefObject<HTMLDivElement | null>;
  readonly token: string;
  readonly isUnavailable: boolean;
};
