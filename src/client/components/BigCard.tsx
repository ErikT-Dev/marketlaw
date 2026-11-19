import type { Card } from "../../shared/catalogue/Card";
import type { TypeName } from "../../shared/catalogue/TypeName";
import { iconUrl } from "../icons/iconUrl";
import { photoUrl } from "../icons/photoUrl";
import { STAT_ICONS } from "../icons/STAT_ICONS";
import type { StatName } from "../icons/StatName";
import styles from "./BigCard.module.css";
import type { CardNameCombosShown } from "./CardNameCombosShown";
import { CardNameWithCombos } from "./CardNameWithCombos";
import { ComboLabel } from "./ComboLabel";
import { sectorColor } from "./sectorColor";
import { TypeChip } from "./TypeChip";

type Props = {
  readonly card: Card;
  readonly realCost: number;
  readonly cardNameCombos?: CardNameCombosShown | undefined;
};

const CARD_STATS = ["workforce", "satisfaction", "quality", "product", "distribution"] as const;

function stripStats(
  card: Card,
  realCost: number,
): ReadonlyArray<{ stat: StatName; value: number }> {
  return [
    { stat: "tier", value: card.tier },
    { stat: "cost", value: realCost },
    ...CARD_STATS.map((stat) => ({ stat, value: card.stats[stat] })).filter(
      ({ value }) => value > 0,
    ),
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

export function BigCard({ card, realCost, cardNameCombos }: Props) {
  return (
    <article
      className={styles["bigCard"]}
      aria-label={card.name}
      style={{ backgroundColor: sectorColor(card.sector, "card") }}
    >
      <div
        className={styles["header"]}
        style={{
          background: sectorColor(card.sector, "solid"),
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
      <div className={styles["strip"]} style={{ background: sectorColor(card.sector, 1) }}>
        {stripStats(card, realCost).map(({ stat, value }) => (
          <span
            key={stat}
            className={styles["stat"]}
            role="img"
            aria-label={`${STAT_ICONS[stat].label} ${String(value)}`}
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
        {card.combos.map((combo, index) => (
          <ComboLabel
            key={String(index)}
            combo={combo}
            highlight={cardNameCombos?.comboHighlights[index] ?? "none"}
          />
        ))}
      </div>
    </article>
  );
}
