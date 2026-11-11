import type { PlayerId } from "../../../shared/PlayerId";
import { Button } from "../../components/Button";
import type { MatchHistoryState } from "./MatchHistoryState";
import { MatchHistoryTable } from "./MatchHistoryTable";
import { RECORD_PAGE_TITLE_ID } from "./RECORD_PAGE_TITLE_ID";
import styles from "./Records.module.css";
import { useMatchHistory } from "./useMatchHistory";

type Props = {
  readonly playerId: PlayerId;
  readonly isOwn: boolean;
};

function problemTextOf(history: Exclude<MatchHistoryState, { kind: "found" }>): string {
  switch (history.kind) {
    case "loading":
      return "Loading the match history.";
    case "failed":
      return "The match history could not be loaded. Try again later.";
    case "account_gone":
      return "This player's account no longer exists.";
  }
}

export function MatchHistoryContent({ playerId, isOwn }: Props) {
  const { history, showOlderGames } = useMatchHistory(playerId);
  if (history.kind !== "found") {
    return (
      <>
        <h1 id={RECORD_PAGE_TITLE_ID}>Match history</h1>
        <p className={styles["intro"]}>{problemTextOf(history)}</p>
      </>
    );
  }
  return (
    <>
      <h1 id={RECORD_PAGE_TITLE_ID}>Match history · {history.username}</h1>
      {history.games.length === 0 ? (
        <section className={styles["empty"]}>
          <h2>No games yet</h2>
          <p className={styles["intro"]}>
            {isOwn ? "Games you finish, or leave, appear here." : "Finished games appear here."}
          </p>
        </section>
      ) : (
        <>
          <p className={styles["intro"]}>
            All games with a game record, newest first. Click a game to see its full record. Click
            any username to see that player&apos;s match history.
          </p>
          <MatchHistoryTable games={history.games} />
        </>
      )}
      {history.olderGames === "failed" ? (
        <p role="alert">The older games could not be loaded. Try again.</p>
      ) : null}
      {history.older === null ? null : (
        <div>
          <Button
            look="secondary"
            onClick={() => void showOlderGames()}
            loadingLabel={history.olderGames === "loading" ? "Loading older games" : null}
          >
            Show older games
          </Button>
        </div>
      )}
    </>
  );
}
