import type { RouteTestStatement } from "./RouteTestStatement.ts";

export type RouteTestDatabase = {
  readonly prepare: (sql: string) => RouteTestStatement;
};
