import { lazy, Suspense } from "react";
import type { CardName } from "../../../shared/catalogue/CardName";
import type { RunningGameClock } from "../game/RunningGameClock";

const CardSetPage = lazy(async () => ({
  default: (await import("./CardSetPage")).CardSetPage,
}));

type Props = {
  readonly openCard: CardName | null;
  readonly gameClock: RunningGameClock | null;
};

export function LazyCardSetPage({ openCard, gameClock }: Props) {
  return (
    <Suspense fallback={null}>
      <CardSetPage openCard={openCard} gameClock={gameClock} />
    </Suspense>
  );
}
