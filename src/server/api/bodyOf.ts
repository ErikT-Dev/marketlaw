import * as v from "valibot";

export async function bodyOf<T extends v.GenericSchema>(
  request: Request,
  schema: T,
): Promise<v.InferOutput<T> | null> {
  const parsed = v.safeParse(schema, await request.json().catch(() => null));
  return parsed.success ? parsed.output : null;
}
