import type { RecordReadStatement } from "./RecordReadStatement";

export type RecordReadDatabase = {
  prepare(query: string): RecordReadStatement;
};
