import type { CardName } from "./catalogue/CardName";
import type { QuestName } from "./catalogue/QuestName";
import type { ProjectName } from "./ProjectName";
import type { SeatNumber } from "./SeatNumber";
import type { TradeName } from "./TradeName";

export type MainPhaseLogEntry =
  | {
      readonly kind: "played";
      readonly turn: number;
      readonly seat: SeatNumber;
      readonly card: CardName;
    }
  | {
      readonly kind: "completed_quest";
      readonly turn: number;
      readonly seat: SeatNumber;
      readonly quest: QuestName;
    }
  | {
      readonly kind: "completed_project";
      readonly turn: number;
      readonly seat: SeatNumber;
      readonly project: ProjectName;
    }
  | {
      readonly kind: "influence";
      readonly turn: number;
      readonly seat: SeatNumber;
      readonly trade: TradeName;
    }
  | {
      readonly kind: "redrew";
      readonly turn: number;
      readonly seat: SeatNumber;
      readonly times: number;
    }
  | {
      readonly kind: "support";
      readonly turn: number;
      readonly seat: SeatNumber;
      readonly funds: number;
    };
