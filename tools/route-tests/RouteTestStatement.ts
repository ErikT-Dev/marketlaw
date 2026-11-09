export type RouteTestStatement = {
  readonly bind: (...values: ReadonlyArray<string | number>) => RouteTestStatement;
  readonly all: () => Promise<{ readonly results: ReadonlyArray<unknown> }>;
  readonly run: () => Promise<unknown>;
};
