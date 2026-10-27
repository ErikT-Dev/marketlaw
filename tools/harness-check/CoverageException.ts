export type CoverageException = {
  readonly rule: string;
  readonly kind: "instead" | "also";
  readonly how: string;
  readonly approved: string;
};
