import { Kind } from "../../../shared/catalogue/Kind";
import type { Tier } from "../../../shared/catalogue/Tier";
import type { DrawActionStatus } from "../../../shared/DrawActionStatus";
import { INFLUENCE_DRAWS } from "../../../shared/ruleFiles/INFLUENCE_DRAWS";
import { sectorColor } from "../../components/sectorColor";
import { StatAmountsIcons } from "../../components/StatAmountsIcons";
import { DrawActionCell } from "./DrawActionCell";
import styles from "./InfluenceDialog.module.css";
import { sectorOfKind } from "./sectorOfKind";

type Props = {
  readonly drawActions: ReadonlyArray<DrawActionStatus>;
  readonly isBusy: boolean;
  readonly onDraw: (kind: Kind, tier: Tier) => void;
};

export function DrawActionTable({ drawActions, isBusy, onDraw }: Props) {
  return (
    <table className={styles["table"]} aria-label="Draw actions">
      <thead>
        <tr>
          <th scope="col">Kind</th>
          {INFLUENCE_DRAWS.map(({ tier, costs }) => (
            <th key={tier} scope="col">
              {`Tier ${String(tier)} · `}
              <StatAmountsIcons amounts={costs} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Kind.options.map((kind) => (
          <tr key={kind}>
            <th
              scope="row"
              className={styles["kind"]}
              style={{
                background: sectorColor(sectorOfKind(kind), "solid"),
                color: sectorColor(sectorOfKind(kind), "solid-text"),
              }}
            >
              {kind}
            </th>
            {INFLUENCE_DRAWS.map(({ tier }) => (
              <td key={tier}>
                <DrawActionCell
                  status={drawActions.find((entry) => entry.kind === kind && entry.tier === tier)}
                  isBusy={isBusy}
                  onDraw={onDraw}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
