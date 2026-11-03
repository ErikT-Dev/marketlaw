import { describe, expect, it } from "vitest";
import { GENERATED_NAME_WORDS } from "./GENERATED_NAME_WORDS";
import { usernameProblem } from "./usernameProblem";

describe("generated names", () => {
  it("are valid usernames of at most 20 characters in every combination", () => {
    const { adjectives, places, titles } = GENERATED_NAME_WORDS;
    const names = adjectives.flatMap((adjective) =>
      places.flatMap((place) => titles.map((title) => `${adjective} ${place} ${title}`)),
    );
    expect(names).toHaveLength(8000);
    expect(names.filter((name) => usernameProblem(name) !== null)).toEqual([]);
  });
});
