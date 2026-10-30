import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import { Panel } from "../../components/Panel";
import { CityPanel } from "./CityPanel";
import { CombosPanel } from "./CombosPanel";
import styles from "./GamePage.module.css";
import { MarketGoPanel } from "./MarketGoPanel";
import { marketGoStateOf } from "./marketGoStateOf";
import { MarketplacePanel } from "./MarketplacePanel";

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
      <MarketplacePanel
        view={view}
        isYourGo={seat.turnDrawRejection === null}
        onTake={
          canTakeMarketCard
            ? (card) => {
                onAction({ type: "turn_draw", choice: { option: "A", card } });
              }
            : null
        }
      />
      <Panel title="Quests" />
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
