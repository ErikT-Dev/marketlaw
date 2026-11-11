import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import { CityPanel } from "./CityPanel";
import { CombosPanel } from "./CombosPanel";
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
  readonly onAction: (action: ActionIntent) => void;
};

export function MiddleColumn({ view, seat, playerNames, isBusy, onAction }: Props) {
  const canTakeMarketCard = seat.marketCardRejection === null && !isBusy;
  return (
    <div className={styles[view.phase === "market" ? "middleInMarketPhase" : "middle"]}>
      {view.phase === "market" ? (
        <MarketPhaseBanner goText={marketGoText(view, seat, playerNames)} />
      ) : null}
      <MarketplacePanel
        view={view}
        isYourGo={seat.turnDrawRejection === null && !seat.hasHadMarketGo}
        onTake={
          canTakeMarketCard
            ? (card) => {
                onAction({ type: "turn_draw", choice: { option: "A", card } });
              }
            : null
        }
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
          <CityPanel city={seat.city} />
          <CombosPanel combos={seat.combos} />
        </div>
      )}
    </div>
  );
}
