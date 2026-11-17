import * as v from "valibot";
import { Sector } from "../../../src/shared/catalogue/Sector.ts";
import { Tier } from "../../../src/shared/catalogue/Tier.ts";
import { TypeName } from "../../../src/shared/catalogue/TypeName.ts";
import type { CardSetFilter } from "../../../src/client/screens/cardSet/CardSetFilter.ts";
import type { ScenarioStep } from "../ScenarioStep.ts";

const FilterCardsStep = v.object({
  sector: v.optional(Sector),
  tier: v.optional(Tier),
  type: v.optional(TypeName),
});

const SearchCardsStep = v.object({ text: v.string() });

export function cardSetFilterAfter(
  filter: CardSetFilter,
  kind: string,
  step: ScenarioStep,
): CardSetFilter {
  if (kind === "filter_cards") {
    const { sector, tier, type } = v.parse(FilterCardsStep, step);
    return { ...filter, sector: sector ?? null, tier: tier ?? null, type: type ?? null };
  }
  if (kind === "search_cards") {
    return { ...filter, nameText: v.parse(SearchCardsStep, step).text };
  }
  return filter;
}
