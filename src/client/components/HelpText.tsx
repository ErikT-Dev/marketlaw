import type { IconTextPart } from "./IconTextPart";
import { TextWithIcons } from "./TextWithIcons";

type Props = {
  readonly parts: ReadonlyArray<IconTextPart>;
};

export function HelpText({ parts }: Props) {
  return (
    <p>
      <TextWithIcons text={parts} />
    </p>
  );
}
