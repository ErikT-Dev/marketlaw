import type { CardName } from "../../shared/catalogue/CardName";
import type { Combo } from "../../shared/catalogue/Combo";
import { cardOf } from "../../shared/catalogue/cardOf";
import type { TypeName } from "../../shared/catalogue/TypeName";
import { compareAlphabetically } from "./compareAlphabetically";
import { compareCombosOfOneCard } from "./compareCombosOfOneCard";

type ComboInList = {
  readonly card: CardName;
  readonly combo: number;
};

type TypeCountCombo = Extract<Combo, { readonly kind: "type_count" }>;

type TypeNeed = {
  readonly infinite: number;
  readonly oneTime: number;
};

type ResolvedEntry<Entry> = {
  readonly entry: Entry;
  readonly combo: Combo;
  readonly isReady: boolean;
};

function typeNeedsOf(combos: ReadonlyArray<Combo>): ReadonlyMap<TypeName, TypeNeed> {
  const typeCombos = combos.filter((combo): combo is TypeCountCombo => combo.kind === "type_count");
  return new Map(
    typeCombos.map(({ type }) => {
      const forType = typeCombos.filter((combo) => combo.type === type);
      const infinite = forType.filter(({ isInfinite }) => isInfinite).length;
      return [type, { infinite, oneTime: forType.length - infinite }];
    }),
  );
}

function compareTypeGroups(
  type: TypeName,
  other: TypeName,
  needs: ReadonlyMap<TypeName, TypeNeed>,
): number {
  const need = needs.get(type) ?? { infinite: 0, oneTime: 0 };
  const otherNeed = needs.get(other) ?? { infinite: 0, oneTime: 0 };
  return (
    otherNeed.infinite - need.infinite ||
    otherNeed.oneTime - need.oneTime ||
    compareAlphabetically(type, other)
  );
}

function compareInList(combo: Combo, other: Combo, needs: ReadonlyMap<TypeName, TypeNeed>) {
  const groupOrder =
    combo.kind === "type_count" && other.kind === "type_count"
      ? compareTypeGroups(combo.type, other.type, needs)
      : 0;
  return groupOrder || compareCombosOfOneCard(combo, other);
}

export function combosInListOrder<Entry extends ComboInList>(
  entries: ReadonlyArray<Entry>,
  isReady: (entry: Entry) => boolean,
): ReadonlyArray<Entry> {
  const resolved = entries.flatMap((entry): ReadonlyArray<ResolvedEntry<Entry>> => {
    const combo = cardOf(entry.card).combos[entry.combo];
    return combo === undefined ? [] : [{ entry, combo, isReady: isReady(entry) }];
  });
  const needs = typeNeedsOf(resolved.map(({ combo }) => combo));
  return [...resolved]
    .sort(
      (first, second) =>
        Number(second.isReady) - Number(first.isReady) ||
        compareInList(first.combo, second.combo, needs) ||
        compareAlphabetically(first.entry.card, second.entry.card) ||
        first.entry.combo - second.entry.combo,
    )
    .map(({ entry }) => entry);
}
