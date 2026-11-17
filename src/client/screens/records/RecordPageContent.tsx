import type { PlayerId } from "../../../shared/PlayerId";
import { GameRecordContent } from "./GameRecordContent";
import { MatchHistoryContent } from "./MatchHistoryContent";
import { RankingContent } from "./RankingContent";
import type { RecordPage } from "./RecordPage";

type Props = {
  readonly page: RecordPage;
  readonly viewerId: PlayerId | null;
  readonly token: string | null;
};

export function RecordPageContent({ page, viewerId, token }: Props) {
  switch (page.kind) {
    case "history":
      return <MatchHistoryContent playerId={page.playerId} isOwn={page.playerId === viewerId} />;
    case "record":
      return <GameRecordContent gameId={page.gameId} viewerId={viewerId} />;
    case "ranking":
      return <RankingContent token={token} />;
  }
}
