import { TextWithIcons } from "../../components/TextWithIcons";
import type { RulebookInline } from "./RulebookInline";
import styles from "./Rules.module.css";
import { SectionLink } from "./SectionLink";

type Props = {
  readonly parts: ReadonlyArray<RulebookInline>;
};

function partShown(part: RulebookInline, index: number) {
  if (typeof part === "string" || !("kind" in part)) {
    return <TextWithIcons key={index} text={[part]} />;
  }
  switch (part.kind) {
    case "bold":
      return (
        <strong key={index}>
          <RulebookInlineParts parts={part.parts} />
        </strong>
      );
    case "italic":
      return (
        <em key={index}>
          <RulebookInlineParts parts={part.parts} />
        </em>
      );
    case "link":
      return (
        <SectionLink key={index} anchor={part.anchor} className={styles["textLink"]}>
          <RulebookInlineParts parts={part.parts} />
        </SectionLink>
      );
  }
}

export function RulebookInlineParts({ parts }: Props) {
  return <>{parts.map(partShown)}</>;
}
