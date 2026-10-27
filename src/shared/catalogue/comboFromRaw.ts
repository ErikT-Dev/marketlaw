import * as v from "valibot";
import type { Result } from "../Result";
import { CardName } from "./CardName";
import type { Combo } from "./Combo";
import { TypeName } from "./TypeName";
import type { RawCard } from "./RawCard";

type ComboSlot = 1 | 2 | 3 | 4;

type RawComboFields = ReadonlyArray<string | number | boolean | null>;

function isEmptyComboSlot(fields: RawComboFields): boolean {
  return fields.every((field) => field === "" || field === null);
}

function isIncompleteComboSlot(fields: RawComboFields): boolean {
  return fields.some((field) => field === "" || field === null);
}

export function comboFromRaw(
  card: RawCard,
  slot: ComboSlot,
  cardNames: ReadonlyArray<string>,
): Result<Combo | undefined, string> {
  const needs = card[`c${slot}ReqType`];
  const count = card[`c${slot}ReqN`];
  const amount = card[`c${slot}GainsN`];
  const stat = card[`c${slot}GainsType`];
  const isInfinite = card[`c${slot}Infinite`];
  const fields = [needs, count, amount, stat, isInfinite];
  if (isEmptyComboSlot(fields)) {
    return { isOk: true, value: undefined };
  }
  if (
    isIncompleteComboSlot(fields) ||
    count === null ||
    amount === null ||
    stat === "" ||
    isInfinite === null
  ) {
    return { isOk: false, error: `combo ${slot} is incomplete` };
  }
  const gains = { stat, amount };
  if (v.is(TypeName, needs)) {
    return { isOk: true, value: { kind: "type_count", type: needs, count, isInfinite, gains } };
  }
  if (!cardNames.includes(needs) || !v.is(CardName, needs)) {
    return { isOk: false, error: `combo ${slot} needs "${needs}", neither a type nor a card` };
  }
  if (count !== 1 || isInfinite) {
    return { isOk: false, error: `combo ${slot} names a card but has a count or is infinite` };
  }
  return { isOk: true, value: { kind: "card_name", card: needs, gains } };
}
