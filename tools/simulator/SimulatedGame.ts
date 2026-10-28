import type { BotKind } from "./BotKind.ts";

export type SimulatedGame = {
  readonly seed: number;
  readonly players: 2 | 3 | 4;
  readonly bot: BotKind;
  readonly messages: ReadonlyArray<string>;
  readonly violations: ReadonlyArray<string>;
  readonly rowsPerAcceptedAction: ReadonlyArray<number>;
  readonly rowsPerOtherMessage: ReadonlyArray<number>;
  readonly turnsPlayed: number;
  readonly acceptedActions: number;
};
