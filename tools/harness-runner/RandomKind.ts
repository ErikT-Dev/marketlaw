export const RANDOM_KINDS = [
  "sector",
  "tier",
  "shuffle",
  "quest",
  "type",
  "seats",
  "generated_name",
] as const;

export type RandomKind = (typeof RANDOM_KINDS)[number];
