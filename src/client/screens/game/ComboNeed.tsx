import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";
import { TypeChip } from "../../components/TypeChip";
import type { ComboOwner } from "./ComboOwner";

type Props = {
  readonly card: CardName;
  readonly combo: number;
  readonly owner: ComboOwner;
};

export function ComboNeed({ card, combo, owner }: Props) {
  const found = cardOf(card).combos[combo];
  if (found === undefined) {
    return <span>{card}</span>;
  }
  const printedOn = owner === "you" ? `${card} · ` : "";
  return found.kind === "card_name" ? (
    <span>{`${printedOn}${found.card} in ${owner === "you" ? "your" : "their"} city`}</span>
  ) : (
    <span>
      {`${printedOn}${String(found.count)} `}
      <TypeChip type={found.type} />
      {found.isInfinite ? ", again at every multiple" : null}
    </span>
  );
}
