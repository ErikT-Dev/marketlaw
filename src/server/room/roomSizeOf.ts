const ROOM_SIZES = [2, 3, 4] as const;

export function roomSizeOf(size: number): 2 | 3 | 4 | null {
  return ROOM_SIZES.find((candidate) => candidate === size) ?? null;
}
