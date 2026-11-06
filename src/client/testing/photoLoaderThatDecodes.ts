import { vi } from "vitest";
import type { PhotoLoader } from "../screens/game/PhotoLoader";

export function photoLoaderThatDecodes(isDecoded: (url: string) => boolean) {
  return {
    decode: vi.fn<PhotoLoader["decode"]>(async (url) =>
      isDecoded(url) ? Promise.resolve() : new Promise<never>(() => undefined),
    ),
    wait: vi.fn<PhotoLoader["wait"]>(() => () => undefined),
  };
}
