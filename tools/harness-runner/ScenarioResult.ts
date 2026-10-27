export type ScenarioResult =
  | { readonly status: "passes" }
  | { readonly status: "fails"; readonly problems: ReadonlyArray<string> }
  | { readonly status: "not_yet"; readonly missing: ReadonlyArray<string> };
