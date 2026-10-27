import * as v from "valibot";
import type { Random } from "../../../src/rules/Random.ts";
import type { CardName } from "../../../src/shared/catalogue/CardName.ts";
import { Sector } from "../../../src/shared/catalogue/Sector.ts";
import { Tier } from "../../../src/shared/catalogue/Tier.ts";
import type { RandomPurpose } from "../RandomPurpose.ts";
import type { ScriptedRandom } from "../ScriptedRandom.ts";

type EngineRandomOptions = {
  readonly scripted: ScriptedRandom;
  readonly purpose: () => RandomPurpose;
  readonly startingDeck: ReadonlyArray<CardName>;
};

function oneOf<T>(candidates: ReadonlyArray<T>, value: unknown, what: string): T {
  const found = candidates.find((candidate) => candidate === value);
  if (found === undefined) {
    throw new Error(`random ${what} ${JSON.stringify(value)} is not one of the possible results`);
  }
  return found;
}

function firstOf<T>(candidates: ReadonlyArray<T>): T {
  const [first] = candidates;
  if (first === undefined) {
    throw new Error("the rules asked to pick from nothing");
  }
  return first;
}

function shuffled(cards: ReadonlyArray<CardName>, value: unknown): ReadonlyArray<CardName> {
  const order: ReadonlyArray<unknown> = Array.isArray(value) ? value : [];
  const isSameCards =
    order.length === cards.length &&
    [...cards].sort().join("|") === [...order].map(String).sort().join("|");
  if (!isSameCards) {
    throw new Error(
      `random shuffle ${JSON.stringify(value)} does not hold exactly the shuffled cards`,
    );
  }
  return order.map((name) => oneOf(cards, name, "shuffle card"));
}

export function engineRandom(options: EngineRandomOptions): Random {
  const { scripted, purpose, startingDeck } = options;
  return {
    pickSector() {
      const draw = scripted.next("sector", purpose());
      return draw.kind === "listed" ? v.parse(Sector, draw.value) : "Residential";
    },
    pickTier(chances) {
      const allowed = Tier.options.filter((tier) => chances[tier] > 0);
      const draw = scripted.next("tier", purpose());
      return draw.kind === "listed" ? oneOf(allowed, draw.value, "tier") : firstOf(allowed);
    },
    pickQuest(candidates) {
      const draw = scripted.next("quest", purpose());
      return draw.kind === "listed" ? oneOf(candidates, draw.value, "quest") : firstOf(candidates);
    },
    pickType(candidates) {
      const draw = scripted.next("type", purpose());
      return draw.kind === "listed" ? oneOf(candidates, draw.value, "type") : firstOf(candidates);
    },
    shuffle(cards) {
      const draw = scripted.next("shuffle", purpose());
      if (draw.kind === "listed") {
        return shuffled(cards, draw.value);
      }
      return purpose() === "setup"
        ? [...startingDeck, ...cards.filter((name) => !startingDeck.includes(name))]
        : cards;
    },
  };
}
