import { lazy, Suspense } from "react";

const PrivacyNoticePage = lazy(async () => ({
  default: (await import("./PrivacyNoticePage")).PrivacyNoticePage,
}));

export function LazyPrivacyNoticePage() {
  return (
    <Suspense fallback={null}>
      <PrivacyNoticePage />
    </Suspense>
  );
}
