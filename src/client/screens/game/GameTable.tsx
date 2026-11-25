import { useState } from "react";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import styles from "./GamePage.module.css";
import type { GamePageProps } from "./GamePageProps";
import { LeftColumn } from "./LeftColumn";
import type { LookedAtCard } from "./LookedAtCard";
import { MiddleColumn } from "./MiddleColumn";
import { RightColumn } from "./RightColumn";

type Props = GamePageProps & {
  readonly view: PlayerView;
  readonly mine: OwnSeatView;
};

export function GameTable(props: Props) {
  const { update, view, mine } = props;
  const playerNames = update.room.playerNames;
  const [lookedAt, setLookedAt] = useState<LookedAtCard | null>(null);
  return (
    <main className={styles["table"]}>
      <div
        className={styles["tableContent"]}
        inert={props.connection !== "open" || props.isOutdated}
      >
        <LeftColumn
          view={view}
          playerNames={playerNames}
          playerIds={update.room.playerIds}
          chat={props.chat}
        />
        <MiddleColumn
          view={view}
          seat={mine}
          playerNames={playerNames}
          isBusy={props.pendingActions.length > 0}
          lookedAt={lookedAt}
          onLookAt={setLookedAt}
          onAction={props.onAction}
        />
        <RightColumn
          view={view}
          seat={mine}
          playerNames={playerNames}
          pendingActions={props.pendingActions}
          lookedAt={lookedAt}
          onLookAt={setLookedAt}
          onAction={props.onAction}
        />
      </div>
    </main>
  );
}
