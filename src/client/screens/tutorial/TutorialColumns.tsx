import { useState } from "react";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { ActionIntent } from "../../../shared/protocol/ActionIntent";
import type { PendingAction } from "../../store/PendingAction";
import type { LookedAtCard } from "../game/LookedAtCard";
import { MiddleColumn } from "../game/MiddleColumn";
import { RightColumn } from "../game/RightColumn";
import type { TutorialFocus } from "./TutorialFocus";
import styles from "./TutorialPage.module.css";

type Props = {
  readonly view: PlayerView;
  readonly mine: OwnSeatView;
  readonly playerNames: ReadonlyArray<string>;
  readonly focus: TutorialFocus;
  readonly pendingActions: ReadonlyArray<PendingAction>;
  readonly onAction: (action: ActionIntent) => void;
};

export function TutorialColumns({ view, mine, playerNames, focus, ...props }: Props) {
  const [lookedAt, setLookedAt] = useState<LookedAtCard | null>(null);
  return (
    <>
      <div
        className={styles["column"]}
        inert={focus.usableColumn !== "middle"}
        data-tutorial-column
      >
        <MiddleColumn
          view={view}
          seat={mine}
          playerNames={playerNames}
          isBusy={props.pendingActions.length > 0}
          lookedAt={lookedAt}
          onLookAt={setLookedAt}
          onAction={props.onAction}
        />
      </div>
      <div className={styles["column"]} inert={focus.usableColumn !== "right"} data-tutorial-column>
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
    </>
  );
}
