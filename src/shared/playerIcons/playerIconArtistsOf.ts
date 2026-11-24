import type { PlayerIconArtist } from "./PlayerIconArtist";

const ARTIST_LINE = /^- ([^,]+?)(?:, .*?)?(?: - CC0)?$/u;

export function playerIconArtistsOf(licenceText: string): ReadonlyArray<PlayerIconArtist> {
  return licenceText.split(/\r?\n/u).flatMap((line) => {
    const name = ARTIST_LINE.exec(line.trim())?.[1]?.trim();
    return name === undefined ? [] : [{ folder: name.toLowerCase().replaceAll(" ", "-"), name }];
  });
}
