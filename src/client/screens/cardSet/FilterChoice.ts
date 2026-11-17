import type { ReactNode } from "react";

export type FilterChoice<Value> = {
  readonly value: Value | null;
  readonly key: string;
  readonly content: ReactNode;
};
