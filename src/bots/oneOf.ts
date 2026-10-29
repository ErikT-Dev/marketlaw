import type { BotChooser } from "./BotChooser";

export function oneOf<T>(items: ReadonlyArray<T>, chooser: BotChooser): T | undefined {
  return items[chooser.pickIndex(items.length)];
}
