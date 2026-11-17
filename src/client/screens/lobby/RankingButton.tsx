import { Button } from "../../components/Button";
import { RANKING_HASH } from "../records/RANKING_HASH";

export function RankingButton() {
  return (
    <Button
      look="menu"
      onClick={() => {
        window.location.assign(RANKING_HASH);
      }}
    >
      ELO ranking
    </Button>
  );
}
