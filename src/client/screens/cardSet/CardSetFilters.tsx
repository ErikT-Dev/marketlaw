import { Sector } from "../../../shared/catalogue/Sector";
import { Tier } from "../../../shared/catalogue/Tier";
import { TYPE_NAMES } from "../../../shared/catalogue/TYPE_NAMES";
import type { TypeName } from "../../../shared/catalogue/TypeName";
import { TypeChip } from "../../components/TypeChip";
import type { CardSetFilter } from "./CardSetFilter";
import type { FilterChoice } from "./FilterChoice";
import { FilterChoiceGroup } from "./FilterChoiceGroup";
import styles from "./CardSet.module.css";

type Props = {
  readonly filter: CardSetFilter;
  readonly onChange: (filter: CardSetFilter) => void;
};

function withAll<Value>(
  choices: ReadonlyArray<FilterChoice<Value>>,
): ReadonlyArray<FilterChoice<Value>> {
  return [{ value: null, key: "all", content: "All" }, ...choices];
}

const SECTOR_CHOICES: ReadonlyArray<FilterChoice<Sector>> = withAll(
  Sector.options.map((sector) => ({ value: sector, key: sector, content: sector })),
);

const TIER_CHOICES: ReadonlyArray<FilterChoice<Tier>> = withAll(
  Tier.options.map((tier) => ({ value: tier, key: String(tier), content: String(tier) })),
);

const TYPE_CHOICES: ReadonlyArray<FilterChoice<TypeName>> = withAll(
  TYPE_NAMES.map((type) => ({ value: type, key: type, content: <TypeChip type={type} /> })),
);

export function CardSetFilters({ filter, onChange }: Props) {
  return (
    <div className={styles["filters"]}>
      <div className={styles["filterRow"]}>
        <FilterChoiceGroup
          label="Sector"
          choices={SECTOR_CHOICES}
          selected={filter.sector}
          onSelect={(sector) => {
            onChange({ ...filter, sector });
          }}
        />
        <FilterChoiceGroup
          label="Tier"
          choices={TIER_CHOICES}
          selected={filter.tier}
          onSelect={(tier) => {
            onChange({ ...filter, tier });
          }}
        />
      </div>
      <FilterChoiceGroup
        label="Type"
        choices={TYPE_CHOICES}
        selected={filter.type}
        onSelect={(type) => {
          onChange({ ...filter, type });
        }}
      />
    </div>
  );
}
