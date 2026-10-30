export type MarketGoState =
  | { readonly kind: "your_go"; readonly isMarketplaceEmpty: boolean }
  | {
      readonly kind: "waiting";
      readonly goName: string;
      readonly namesBefore: ReadonlyArray<string>;
    }
  | { readonly kind: "had_go" };
