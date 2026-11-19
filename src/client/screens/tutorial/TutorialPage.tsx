import styles from "../game/GamePage.module.css";
import { HighlightedParts } from "../game/HighlightedParts";
import { PlayerIconColors } from "../game/PlayerIconColors";
import { ServerClockOffset } from "../game/ServerClockOffset";
import { RULES_HASH } from "../rules/RULES_HASH";
import { TUTORIAL_FOCUS } from "./TUTORIAL_FOCUS";
import { TutorialColumns } from "./TutorialColumns";
import { TutorialCompleteDialog } from "./TutorialCompleteDialog";
import type { TutorialFocus } from "./TutorialFocus";
import type { TutorialPageProps } from "./TutorialPageProps";
import tutorialStyles from "./TutorialPage.module.css";
import { TutorialNotices } from "./TutorialNotices";
import { TutorialTextBox } from "./TutorialTextBox";
import { tutorialTextBoxOf } from "./tutorialTextBoxOf";
import { TutorialTopBar } from "./TutorialTopBar";

type Props = TutorialPageProps;

const COMPLETE_FOCUS: TutorialFocus = { highlighted: [], usableColumn: "none" };

export function TutorialPage(props: Props) {
  const { game: view, progress } = props.tutorial;
  const mine = view.seats.find((seat) => seat.kind === "own");
  if (mine?.kind !== "own") {
    return null;
  }
  const isConnected = props.connection === "open";
  const playerNames = [props.playerName];
  const focus = progress.kind === "step" ? TUTORIAL_FOCUS[progress.step] : COMPLETE_FOCUS;
  return (
    <ServerClockOffset.Provider value={props.serverClockOffsetMs}>
      <div className={styles["page"]}>
        <TutorialTopBar view={view} onLeave={props.onLeave} isConnected={isConnected} />
        <HighlightedParts.Provider value={focus.highlighted}>
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
            <PlayerIconColors.Provider value={[props.playerIconColor]}>
              <TutorialColumns
                view={view}
                mine={mine}
                playerNames={playerNames}
                focus={focus}
                pendingActions={props.pendingActions}
                onAction={props.onAction}
              />
            </PlayerIconColors.Provider>
          </main>
        </HighlightedParts.Provider>
        <TutorialNotices {...props} view={view} mine={mine} playerNames={playerNames} />
        {progress.kind === "complete" ? (
          <TutorialCompleteDialog
            isConnected={isConnected}
            onReadRules={() => {
              window.location.assign(RULES_HASH);
              props.onLeave();
            }}
            onPlayAgain={props.onRestart}
            onGoToLobby={props.onLeave}
          />
        ) : null}
      </div>
    </ServerClockOffset.Provider>
  );
}
