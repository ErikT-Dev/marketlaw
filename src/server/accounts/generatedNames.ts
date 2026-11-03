import { GENERATED_NAME_WORDS } from "./GENERATED_NAME_WORDS";

export function generatedNames(randomBelow: (limit: number) => number, count: number) {
  const { adjectives, places, titles } = GENERATED_NAME_WORDS;
  return Array.from({ length: count }, () =>
    [
      adjectives[randomBelow(adjectives.length)] ?? adjectives[0],
      places[randomBelow(places.length)] ?? places[0],
      titles[randomBelow(titles.length)] ?? titles[0],
    ].join(" "),
  );
}
