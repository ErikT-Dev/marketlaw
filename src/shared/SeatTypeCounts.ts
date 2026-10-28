import type { TypeName } from "./catalogue/TypeName";

export type SeatTypeCounts = Readonly<Partial<Record<TypeName, number>>>;
