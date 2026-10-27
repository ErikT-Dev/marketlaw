import { TYPE_POINTS } from "./TYPE_POINTS";
import type { TypeName } from "./TypeName";

export function knownTypeName(text: string): TypeName | undefined {
  return [...TYPE_POINTS.keys()].find((type) => type === text);
}
