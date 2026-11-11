import type { CardName } from "../../../shared/catalogue/CardName";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import { CityPanel } from "./CityPanel";
import { CombosPanel } from "./CombosPanel";
import type { LookedAtCard } from "./LookedAtCard";
import styles from "./GamePage.module.css";
import { MarketGoPanel } from "./MarketGoPanel";
import { marketGoStateOf } from "./marketGoStateOf";
import { marketGoText } from "./marketGoText";
import { MarketPhaseBanner } from "./MarketPhaseBanner";
import { MarketplacePanel } from "./MarketplacePanel";
import { QuestsPanel } from "./QuestsPanel";

type Props = {
  readonly view: PlayerView;
  readonly seat: OwnSeatView;
  readonly playerNames: ReadonlyArray<string>;
  readonly isBusy: boolean;
  readonly lookedAt: LookedAtCard | null;
  readonly onLookAt: (lookedAt: LookedAtCard | null) => void;
  readonly onAction: (action: ActionIntent) => void;
};

function lookedAtIn(lookedAt: LookedAtCard | null, place: LookedAtCard["place"]) {
  return lookedAt !== null && lookedAt.place === place ? lookedAt.card : null;
}

export function MiddleColumn(props: Props) {
  const { view, seat, playerNames, isBusy, lookedAt, onLookAt, onAction } = props;
  const canTakeMarketCard = seat.marketCardRejection === null;
  const isYourGo = seat.turnDrawRejection === null && !seat.hasHadMarketGo;
  function drawMarketCard(card: CardName) {
    onLookAt(null);
    onAction({ type: "turn_draw", choice: { option: "A", card } });
  }
  return (
    <div className={styles[view.phase === "market" ? "middleInMarketPhase" : "middle"]}>
      {view.phase === "market" ? (
        <MarketPhaseBanner
          goText={marketGoText(view, seat, playerNames)}
          isYourGo={view.marketGo === view.seat}
        />
      ) : null}
      <MarketplacePanel
        view={view}
        isYourGo={isYourGo}
        selected={lookedAtIn(lookedAt, "marketplace")}
        onSelect={(card) => {
          onLookAt({ card, place: "marketplace" });
        }}
        onDraw={canTakeMarketCard && !isBusy ? drawMarketCard : null}
      />
      <QuestsPanel
        quests={view.quests}
        completedLastTurn={view.questsCompletedLastTurn}
        viewer={view.seat}
        playerNames={playerNames}
        isBusy={isBusy}
        onComplete={(quest) => {
          onAction({ type: "complete_quest", quest });
        }}
      />
      {view.phase === "market" ? (
        <MarketGoPanel
          state={marketGoStateOf(view, seat, playerNames)}
          isBusy={isBusy}
          onChooseSector={(sector) => {
            onAction({ type: "turn_draw", choice: { option: "B", sector } });
          }}
        />
      ) : (
        <div className={styles["cityRow"]}>
          <CityPanel
            city={seat.city}
            selected={lookedAtIn(lookedAt, "city")}
            onSelect={(card) => {
              onLookAt({ card, place: "city" });
            }}
          />
          <CombosPanel combos={seat.combos} />
        </div>
      )}
    </div>
  );
}
