import type { CardNameSize } from "./CardNameSize";
import type { CardTileKind } from "./CardTileKind";

const LONGEST_NAME_OF_SIZE: Readonly<
  Record<CardTileKind, Readonly<Record<Exclude<CardNameSize, "smallest">, number>>>
> = {
  hand: { regular: 16, small: 24 },
  city: { regular: 14, small: 22 },
  market: { regular: 12, small: 20 },
};

export function cardNameSizeOf(name: string, kind: CardTileKind): CardNameSize {
  const longest = LONGEST_NAME_OF_SIZE[kind];
  if (name.length <= longest.regular) {
    return "regular";
  }
  return name.length <= longest.small ? "small" : "smallest";
}
