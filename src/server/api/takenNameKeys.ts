import * as v from "valibot";
import { nameKeyOf } from "../accounts/nameKeyOf";

const NAME_KEY_ROWS = v.array(v.object({ name_key: v.string() }));

export async function takenNameKeys(
  db: D1Database,
  names: ReadonlyArray<string>,
): Promise<ReadonlyArray<string>> {
  const keys = names.map(nameKeyOf);
  const { results } = await db
    .prepare(`SELECT name_key FROM players WHERE name_key IN (${keys.map(() => "?").join(", ")})`)
    .bind(...keys)
    .all();
  const parsed = v.safeParse(NAME_KEY_ROWS, results);
  return parsed.success ? parsed.output.map(({ name_key: key }) => key) : keys;
}
