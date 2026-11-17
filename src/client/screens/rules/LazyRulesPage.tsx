import { lazy, Suspense } from "react";
import type { RunningGameClock } from "../game/RunningGameClock";
import type { RulesPageAddress } from "./RulesPageAddress";

const RulesPage = lazy(async () => ({
  default: (await import("./RulesPage")).RulesPage,
}));

type Props = {
  readonly address: RulesPageAddress;
  readonly gameClock: RunningGameClock | null;
};

export function LazyRulesPage({ address, gameClock }: Props) {
  return (
    <Suspense fallback={null}>
      <RulesPage address={address} gameClock={gameClock} />
    </Suspense>
  );
}
