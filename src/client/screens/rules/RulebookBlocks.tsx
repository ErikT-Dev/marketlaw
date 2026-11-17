import { TextWithIcons } from "../../components/TextWithIcons";
import type { RulebookBlock } from "./RulebookBlock";
import { RulebookInlineParts } from "./RulebookInlineParts";
import { RulebookTable } from "./RulebookTable";
import styles from "./Rules.module.css";

type Props = {
  readonly blocks: ReadonlyArray<RulebookBlock>;
};

function blockShown(block: RulebookBlock, index: number) {
  switch (block.kind) {
    case "paragraph":
      return (
        <p key={index}>
          <RulebookInlineParts parts={block.parts} />
        </p>
      );
    case "list": {
      const List = block.isOrdered ? "ol" : "ul";
      return (
        <List key={index}>
          {block.items.map((item, itemIndex) => (
            <li key={itemIndex}>
              <RulebookInlineParts parts={item} />
            </li>
          ))}
        </List>
      );
    }
    case "table":
      return <RulebookTable key={index} header={block.header} rows={block.rows} />;
    case "preformatted":
      return (
        <pre key={index} className={styles["preformatted"]}>
          {block.lines.map((line, lineIndex) => (
            <span key={lineIndex} className={styles["preformattedLine"]}>
              <TextWithIcons text={line} />
            </span>
          ))}
        </pre>
      );
  }
}

export function RulebookBlocks({ blocks }: Props) {
  return <>{blocks.map(blockShown)}</>;
}
