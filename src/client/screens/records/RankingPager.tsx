import type { RankingResponse } from "../../../shared/api/RankingResponse";
import type { RankingPage } from "../../../shared/api/RankingPage";
import { Button } from "../../components/Button";
import { rankingPagerText } from "./rankingPagerText";
import styles from "./Records.module.css";

type Props = {
  readonly ranking: RankingResponse;
  readonly onShowPage: (page: RankingPage) => void;
};

export function RankingPager({ ranking, onShowPage }: Props) {
  const pagerText = rankingPagerText(ranking);
  return (
    <nav className={styles["pager"]} aria-label="Ranking pages">
      <Button
        look="secondary"
        isDisabled={ranking.page <= 1}
        onClick={() => {
          onShowPage(ranking.page - 1);
        }}
      >
        ‹ Previous
      </Button>
      {pagerText === null ? null : <span className={styles["pagerText"]}>{pagerText}</span>}
      <Button
        look="secondary"
        isDisabled={ranking.page >= ranking.pageCount}
        onClick={() => {
          onShowPage(ranking.page + 1);
        }}
      >
        Next ›
      </Button>
      <Button
        look="primary"
        isDisabled={ranking.standing.kind !== "placed"}
        onClick={() => {
          onShowPage("mine");
        }}
      >
        Jump to me
      </Button>
    </nav>
  );
}
