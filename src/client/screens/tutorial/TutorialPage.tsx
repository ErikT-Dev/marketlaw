import { useState } from "react";
import styles from "../game/GamePage.module.css";
import type { LookedAtCard } from "../game/LookedAtCard";
import { MiddleColumn } from "../game/MiddleColumn";
import { RightColumn } from "../game/RightColumn";
import { ServerClockOffset } from "../game/ServerClockOffset";
import type { TutorialPageProps } from "./TutorialPageProps";
import tutorialStyles from "./TutorialPage.module.css";
import { TutorialNotices } from "./TutorialNotices";
import { TutorialTextBox } from "./TutorialTextBox";
import { tutorialTextBoxOf } from "./tutorialTextBoxOf";
import { TutorialTopBar } from "./TutorialTopBar";

type Props = TutorialPageProps;

export function TutorialPage(props: Props) {
  const { game: view, progress } = props.tutorial;
  const mine = view.seats.find((seat) => seat.kind === "own");
  const [lookedAt, setLookedAt] = useState<LookedAtCard | null>(null);
  if (mine?.kind !== "own") {
    return null;
  }
  const isConnected = props.connection === "open";
  const playerNames = [props.playerName];
  return (
    <ServerClockOffset.Provider value={props.serverClockOffsetMs}>
      <div className={styles["page"]}>
        <TutorialTopBar view={view} onLeave={props.onLeave} isConnected={isConnected} />
        <main className={styles["table"]} inert={!isConnected || props.isOutdated}>
          <div className={tutorialStyles["left"]}>
            {progress.kind === "step" ? (
              <TutorialTextBox
                content={tutorialTextBoxOf(progress.step, progress.number)}
                isConnected={isConnected}
                onContinue={props.onContinue}
                onRestart={props.onRestart}
              />
            ) : null}
          </div>
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
        </main>
        <TutorialNotices {...props} view={view} mine={mine} playerNames={playerNames} />
      </div>
    </ServerClockOffset.Provider>
  );
}
