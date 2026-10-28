import type { BotKind } from "./BotKind.ts";

export type SimulatedGame = {
  readonly seed: number;
  readonly players: 2 | 3 | 4;
  readonly bot: BotKind;
  readonly messages: ReadonlyArray<string>;
  readonly firstViolationAt: number | null;
  readonly violations: ReadonlyArray<string>;
  readonly rowsPerAcceptedAction: ReadonlyArray<number>;
  readonly rowsPerOtherMessage: ReadonlyArray<number>;
  readonly turnsPlayed: number;
  readonly acceptedActions: number;
  readonly acceptedByType: Readonly<Record<string, number>>;
};
