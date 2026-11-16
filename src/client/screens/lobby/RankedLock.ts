import type { IconText } from "../../components/IconText";

export type RankedLock = {
  readonly text: IconText | null;
  readonly canSendConfirmationAgain: boolean;
};
