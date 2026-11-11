import { TextWithIcons } from "../../components/TextWithIcons";
import { comboGainsText } from "./comboGainsText";
import type { GameRecordRow } from "./GameRecordRow";
import { projectsText } from "./projectsText";
import { seatResultText } from "./seatResultText";
import { typeCountsText } from "./typeCountsText";

export const GAME_RECORD_ROWS: ReadonlyArray<GameRecordRow> = [
  { label: "Place and result", valueOf: seatResultText },
  { label: "Score", valueOf: (seat) => seat.score },
  { label: "Reached the end goal", valueOf: (seat) => (seat.hasReachedEndGoal ? "yes" : "no") },
  { label: [{ stat: "income" }], valueOf: (seat) => seat.income },
  { label: [{ stat: "funds" }, " + cards in hand"], valueOf: (seat) => seat.fundsAndHand },
  { label: [{ stat: "workforce" }], valueOf: (seat) => seat.workforce },
  { label: [{ stat: "quality" }], valueOf: (seat) => seat.quality },
  { label: [{ stat: "satisfaction" }], valueOf: (seat) => seat.satisfaction },
  { label: [{ stat: "product" }], valueOf: (seat) => seat.product },
  { label: [{ stat: "distribution" }], valueOf: (seat) => seat.distribution },
  { label: [{ stat: "influence" }], valueOf: (seat) => seat.influence },
  { label: "Bonus-type points", valueOf: (seat) => seat.bonusTypePoints },
  { label: "Projects completed", valueOf: projectsText },
  { label: "Quests completed", valueOf: (seat) => seat.questsCompleted },
  { label: "From combos", valueOf: (seat) => <TextWithIcons text={comboGainsText(seat)} /> },
  { label: "Type counts", valueOf: (seat) => <TextWithIcons text={typeCountsText(seat)} /> },
];
