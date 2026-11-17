import type { RunningGameClock } from "./RunningGameClock";
import styles from "./ClockKeepsRunningNote.module.css";
import { ServerClockOffset } from "./ServerClockOffset";
import { YourClock } from "./YourClock";

type Props = {
  readonly text: string;
  readonly gameClock: RunningGameClock;
};

export function ClockKeepsRunningNote({ text, gameClock }: Props) {
  return (
    <div className={styles["note"]} role="note">
      <span>{text}</span>
      <ServerClockOffset.Provider value={gameClock.serverClockOffsetMs}>
        <YourClock
          view={gameClock.view}
          seat={gameClock.seat}
          playerNames={gameClock.playerNames}
        />
      </ServerClockOffset.Provider>
    </div>
  );
}
