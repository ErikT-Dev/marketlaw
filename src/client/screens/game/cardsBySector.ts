import type { Card } from "../../../shared/catalogue/Card";
import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";
import type { Sector } from "../../../shared/catalogue/Sector";

const SECTORS: ReadonlyArray<Sector> = ["Residential", "Industry", "Service", "Public"];

export function cardsBySector(
  city: ReadonlyArray<CardName>,
): ReadonlyArray<{ readonly sector: Sector; readonly cards: ReadonlyArray<Card> }> {
  const cards = city.map(cardOf);
  return SECTORS.map((sector) => ({
    sector,
    cards: cards.filter((card) => card.sector === sector),
  }));
}
