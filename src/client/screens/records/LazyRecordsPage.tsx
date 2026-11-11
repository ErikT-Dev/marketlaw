import { lazy, Suspense } from "react";
import type { PlayerId } from "../../../shared/PlayerId";
import type { RecordPage } from "./RecordPage";

const RecordsPage = lazy(async () => ({
  default: (await import("./RecordsPage")).RecordsPage,
}));

type Props = {
  readonly page: RecordPage;
  readonly viewerId: PlayerId | null;
};

export function LazyRecordsPage({ page, viewerId }: Props) {
  return (
    <Suspense fallback={null}>
      <RecordsPage page={page} viewerId={viewerId} />
    </Suspense>
  );
}
