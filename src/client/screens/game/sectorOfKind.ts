import type { Kind } from "../../../shared/catalogue/Kind";
import type { Sector } from "../../../shared/catalogue/Sector";

export function sectorOfKind(kind: Kind): Sector {
  switch (kind) {
    case "Residential":
    case "Industry":
    case "Service":
      return kind;
    case "Public quality card":
    case "Public satisfaction card":
      return "Public";
  }
}
