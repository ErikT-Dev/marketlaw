import { StatChip } from "../../components/StatChip";
import { TypeChip } from "../../components/TypeChip";
import type { CardDetail } from "./CardDetail";
import styles from "./CardDetail.module.css";
import { CardDetailCombos } from "./CardDetailCombos";
import { CardStatAmounts } from "./CardStatAmounts";

type Props = {
  readonly detail: CardDetail;
};

export function CardDetailFacts({ detail }: Props) {
  const { card } = detail;
  return (
    <dl className={styles["facts"]}>
      <dt>Sector and tier</dt>
      <dd>
        {card.sector} · tier {card.tier}
      </dd>
      <dt>Base cost</dt>
      <dd>
        <StatChip stat="cost" value={card.baseCost} /> (you pay 1 more for every card you already
        have in play with the same sector and tier)
      </dd>
      <dt>Gives</dt>
      <dd>
        <CardStatAmounts amounts={detail.gives} sign="+" />
      </dd>
      <dt>Uses up</dt>
      <dd>
        <CardStatAmounts amounts={detail.usesUp} sign={"−"} />
      </dd>
      <dt>Types</dt>
      <dd>
        {card.types.flatMap(({ type, count }) =>
          count === 2
            ? [<TypeChip key={type} type={type} />, <TypeChip key={`${type} again`} type={type} />]
            : [<TypeChip key={type} type={type} />],
        )}
      </dd>
      <dt>Combos</dt>
      <dd>
        <CardDetailCombos combos={card.combos} />
      </dd>
    </dl>
  );
}
