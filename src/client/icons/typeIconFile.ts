import type { TypeName } from "../../shared/catalogue/TypeName";

export function typeIconFile(type: TypeName): string {
  return type.toUpperCase().replaceAll(" ", "_");
}
