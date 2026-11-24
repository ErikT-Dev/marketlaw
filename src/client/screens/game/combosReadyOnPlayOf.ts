import type { Card } from "../../../shared/catalogue/Card";
import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";
import type { Combo } from "../../../shared/catalogue/Combo";
import type { TypeName } from "../../../shared/catalogue/TypeName";
import type { OwnSeatView } from "../../../shared/OwnSeatView";

function typeCountAfterPlaying(card: Card, seat: OwnSeatView, type: TypeName): number {
  const own = card.types.find((entry) => entry.type === type)?.count ?? 0;
  return (seat.typeCounts[type] ?? 0) + own;
}

function timesAllowedAfterPlaying(card: Card, combo: Combo, seat: OwnSeatView): number {
  if (combo.kind === "card_name") {
    return seat.city.includes(combo.card) || combo.card === card.name ? 1 : 0;
  }
  const count = typeCountAfterPlaying(card, seat, combo.type);
  if (combo.isInfinite) {
    return Math.floor(count / combo.count);
  }
  return count >= combo.count ? 1 : 0;
}

export function combosReadyOnPlayOf(card: CardName, seat: OwnSeatView): ReadonlyArray<number> {
  const played = cardOf(card);
  return played.combos.map((combo, index) => {
    const claimed =
      seat.combos.find((status) => status.card === card && status.combo === index)?.claimedTimes ??
      0;
    return Math.max(0, timesAllowedAfterPlaying(played, combo, seat) - claimed);
  });
}
