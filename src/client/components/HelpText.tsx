import type { HelpTextPart } from "./HelpTextPart";
import { StatChip } from "./StatChip";

type Props = {
  readonly parts: ReadonlyArray<HelpTextPart>;
};

export function HelpText({ parts }: Props) {
  return (
    <p>
      {parts.map((part, index) =>
        typeof part === "string" ? (
          part
        ) : (
          <StatChip key={`${part.stat} ${String(index)}`} stat={part.stat} />
        ),
      )}
    </p>
  );
}
