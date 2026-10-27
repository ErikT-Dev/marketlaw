import * as v from "valibot";
import type { Result } from "../../src/shared/Result.ts";
import type { RequiredList } from "./RequiredList.ts";

const REQUIRED_FILE = v.strictObject({
  scenarios: v.record(v.string(), v.array(v.string())),
  invariants: v.array(v.string()),
  budgets: v.array(v.string()),
});

export function readRequiredList(parsed: unknown): Result<RequiredList, ReadonlyArray<string>> {
  const result = v.safeParse(REQUIRED_FILE, parsed);
  if (!result.success) {
    return {
      isOk: false,
      error: result.issues.map(
        (issue) => `required.yaml ${v.getDotPath(issue) ?? ""}: ${issue.message}`,
      ),
    };
  }
  return {
    isOk: true,
    value: {
      scenarios: Object.entries(result.output.scenarios).flatMap(([file, names]) =>
        names.map((name) => ({ file, name })),
      ),
      invariants: result.output.invariants,
      budgets: result.output.budgets,
    },
  };
}
