export type TimedOutNotice =
  | {
      readonly kind: "timed_out";
      readonly gameKind: "ranked";
      readonly inARow: number;
      readonly of: number;
    }
  | { readonly kind: "timed_out"; readonly gameKind: "casual" };
