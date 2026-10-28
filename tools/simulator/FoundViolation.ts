import type { BotKind } from "./BotKind.ts";

export type FoundViolation = {
  readonly invariant: string;
  readonly message: string;
  readonly seed: number;
  readonly players: 2 | 3 | 4;
  readonly bot: BotKind;
  readonly messages: ReadonlyArray<string>;
};
