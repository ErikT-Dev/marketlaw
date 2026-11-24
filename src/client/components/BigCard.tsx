import type { Card } from "../../shared/catalogue/Card";
import type { TypeName } from "../../shared/catalogue/TypeName";
import { iconUrl } from "../icons/iconUrl";
import { photoUrl } from "../icons/photoUrl";
import { combosOfOneCardInListOrder } from "../sorting/combosOfOneCardInListOrder";
import { STAT_ICONS } from "../icons/STAT_ICONS";
import type { StatName } from "../icons/StatName";
import styles from "./BigCard.module.css";
import type { CardNameCombosShown } from "./CardNameCombosShown";
import { CardNameWithCombos } from "./CardNameWithCombos";
import { ComboLabel } from "./ComboLabel";
import { SECTOR_STAT_EFFECTS } from "./SECTOR_STAT_EFFECTS";
import { sectorColor } from "./sectorColor";
import { TypeChip } from "./TypeChip";

type Props = {
  readonly card: Card;
  readonly realCost: number;
  readonly cardNameCombos?: CardNameCombosShown | undefined;
  readonly comboReadyTimesOnPlay?: ReadonlyArray<number> | undefined;
};

const CARD_STATS = ["workforce", "satisfaction", "quality", "product", "distribution"] as const;

function stripStats(
  card: Card,
  realCost: number,
): ReadonlyArray<{ stat: StatName; value: string }> {
  const { gives } = SECTOR_STAT_EFFECTS[card.sector];
  return [
    { stat: "tier", value: String(card.tier) },
    { stat: "cost", value: String(realCost) },
    ...CARD_STATS.filter((stat) => card.stats[stat] > 0).map((stat) => ({
      stat,
      value: `${gives.includes(stat) ? "+" : "−"}${String(card.stats[stat])}`,
    })),
  ];
}

function typeIcons(card: Card): ReadonlyArray<{ type: TypeName; key: string }> {
  return card.types.flatMap(({ type, count }) =>
    count === 2
      ? [
          { type, key: type },
          { type, key: `${type} again` },
        ]
      : [{ type, key: type }],
  );
}

export function BigCard({ card, realCost, cardNameCombos, comboReadyTimesOnPlay }: Props) {
  return (
    <article
      className={styles["bigCard"]}
      aria-label={card.name}
      style={{ backgroundColor: sectorColor(card.sector, "card") }}
    >
      <div
        className={styles["header"]}
        style={{
          background: sectorColor(card.sector, "bar"),
          color: sectorColor(card.sector, "solid-text"),
        }}
      >
        <strong>#{card.number}</strong>
        <CardNameWithCombos
          name={card.name}
          readyingCombos={cardNameCombos?.readyingCombos ?? []}
        />
      </div>
      <img
        key={card.name}
        className={styles["photo"]}
        src={photoUrl(card.photo)}
        alt=""
        style={{ background: sectorColor(card.sector, "solid") }}
      />
      <div className={styles["strip"]} style={{ background: sectorColor(card.sector, "bar") }}>
        {stripStats(card, realCost).map(({ stat, value }) => (
          <span
            key={stat}
            className={styles["stat"]}
            role="img"
            aria-label={`${STAT_ICONS[stat].label} ${value}`}
          >
            <img src={iconUrl(STAT_ICONS[stat].file)} alt="" />
            <span aria-hidden="true" style={{ color: `var(--color-stat-${stat})` }}>
              {value}
            </span>
          </span>
        ))}
      </div>
      <div className={styles["types"]}>
        {typeIcons(card).map(({ type, key }) => (
          <TypeChip key={key} type={type} />
        ))}
      </div>
      <div className={styles["combos"]}>
        {combosOfOneCardInListOrder(card.combos).map(({ combo, printedIndex }) => (
          <ComboLabel
            key={String(printedIndex)}
            combo={combo}
            highlight={cardNameCombos?.comboHighlights[printedIndex] ?? "none"}
            readyTimesOnPlay={comboReadyTimesOnPlay?.[printedIndex]}
          />
        ))}
      </div>
    </article>
  );
}
