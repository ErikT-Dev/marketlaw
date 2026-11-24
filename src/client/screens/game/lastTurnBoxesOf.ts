import type { LastTurn } from "../../../shared/LastTurn";
import type { LastTurnBox } from "./LastTurnBox";
import type { LastTurnRow } from "./LastTurnRow";

export function lastTurnBoxesOf(lastTurn: LastTurn): ReadonlyArray<LastTurnBox> {
  return [
    {
      title: "Quests completed",
      iconFile: "MEDAL",
      rows: lastTurn.quests.flatMap(({ quest, seats, firstCompletionFunds }) =>
        seats.map((seat): LastTurnRow => ({ kind: "quest", seat, quest, firstCompletionFunds })),
      ),
    },
    {
      title: "Projects completed",
      iconFile: null,
      rows: lastTurn.projects.flatMap(({ project, seats }) =>
        seats.map((seat): LastTurnRow => ({ kind: "project", seat, project })),
      ),
    },
    {
      title: "Income gained",
      iconFile: "INCOME",
      rows: lastTurn.incomeGains.map(({ seat, income }) => ({ kind: "income", seat, income })),
    },
    {
      title: "Support",
      iconFile: "FUNDS",
      rows: lastTurn.support.map(({ seat, funds }) => ({ kind: "support", seat, funds })),
    },
  ];
}
