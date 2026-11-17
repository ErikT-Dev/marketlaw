import type { RulebookInline } from "./RulebookInline";
import { RulebookInlineParts } from "./RulebookInlineParts";
import styles from "./Rules.module.css";

type Cell = ReadonlyArray<RulebookInline>;

type Props = {
  readonly header: ReadonlyArray<Cell>;
  readonly rows: ReadonlyArray<ReadonlyArray<Cell>>;
};

export function RulebookTable({ header, rows }: Props) {
  return (
    <table className={styles["table"]}>
      <thead>
        <tr>
          {header.map((cell, index) => (
            <th key={index} scope="col">
              <RulebookInlineParts parts={cell} />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, index) => (
              <td key={index}>
                <RulebookInlineParts parts={cell} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
