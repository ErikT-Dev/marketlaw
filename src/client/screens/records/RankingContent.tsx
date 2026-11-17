import { RankingPager } from "./RankingPager";
import { rankingStandingText } from "./rankingStandingText";
import { RankingTable } from "./RankingTable";
import { RECORD_PAGE_TITLE_ID } from "./RECORD_PAGE_TITLE_ID";
import styles from "./Records.module.css";
import { useRanking } from "./useRanking";

type Props = {
  readonly token: string | null;
};

export function RankingContent({ token }: Props) {
  const { ranking, isFailed, showPage } = useRanking(token);
  const title = <h1 id={RECORD_PAGE_TITLE_ID}>ELO ranking</h1>;
  if (ranking === null) {
    return (
      <>
        {title}
        <p className={styles["intro"]}>
          {isFailed ? "The ranking could not be loaded. Try again later." : "Loading the ranking."}
        </p>
      </>
    );
  }
  const standingText = rankingStandingText(ranking.standing);
  const ownPlace = ranking.standing.kind === "placed" ? ranking.standing.place : null;
  return (
    <>
      {title}
      <p className={styles["intro"]}>
        Every registered player with at least 1 ranked game, highest rating first. Equal ratings:
        more ranked games first, then by username.
      </p>
      <RankingPager ranking={ranking} onShowPage={showPage} />
      {isFailed ? <p role="alert">The page could not be loaded. Try again.</p> : null}
      {standingText === null ? null : <p className={styles["standing"]}>{standingText}</p>}
      {ranking.entries.length === 0 ? (
        <p className={styles["intro"]}>Nobody is in the ranking yet.</p>
      ) : (
        <RankingTable entries={ranking.entries} ownPlace={ownPlace} />
      )}
    </>
  );
}
