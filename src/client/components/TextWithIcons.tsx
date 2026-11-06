import type { IconText } from "./IconText";
import type { IconTextPart } from "./IconTextPart";
import { StatChip } from "./StatChip";
import { TypeChip } from "./TypeChip";

type Props = {
  readonly text: IconText;
};

function partShown(part: IconTextPart, index: number) {
  if (typeof part === "string") {
    return part;
  }
  if ("stat" in part) {
    return <StatChip key={`${part.stat} ${String(index)}`} stat={part.stat} value={part.value} />;
  }
  return <TypeChip key={`${part.type} ${String(index)}`} type={part.type} count={part.count} />;
}

export function TextWithIcons({ text }: Props) {
  return <>{typeof text === "string" ? text : text.map(partShown)}</>;
}
