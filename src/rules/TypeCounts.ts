import type { TypeName } from "../shared/catalogue/TypeName";

export type TypeCounts = Readonly<Partial<Record<TypeName, number>>>;
