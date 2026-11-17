import { lazy, Suspense } from "react";
import type { RunningGameClock } from "../game/RunningGameClock";

const CardSetPage = lazy(async () => ({
  default: (await import("./CardSetPage")).CardSetPage,
}));

type Props = {
  readonly gameClock: RunningGameClock | null;
};

export function LazyCardSetPage({ gameClock }: Props) {
  return (
    <Suspense fallback={null}>
      <CardSetPage gameClock={gameClock} />
    </Suspense>
  );
}
