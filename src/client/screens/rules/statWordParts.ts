import type { IconTextPart } from "../../components/IconTextPart";
import type { StatName } from "../../icons/StatName";

const STAT_OF_WORD: Readonly<Record<string, StatName>> = {
  "build passes": "buildPasses",
  "build pass": "buildPasses",
  funds: "funds",
  fund: "funds",
  income: "income",
  influence: "influence",
  workforce: "workforce",
  quality: "quality",
  satisfaction: "satisfaction",
  product: "product",
  distribution: "distribution",
};

const WORD_CHARACTER = "[A-Za-z0-9_-]";

const STAT_WORD = new RegExp(
  `(?<!${WORD_CHARACTER})(${Object.keys(STAT_OF_WORD).join("|")})(?!${WORD_CHARACTER})`,
  "gi",
);

type Split = {
  readonly parts: ReadonlyArray<IconTextPart>;
  readonly end: number;
};

export function statWordParts(text: string): ReadonlyArray<IconTextPart> {
  const split = [...text.matchAll(STAT_WORD)].reduce<Split>(
    (sofar, match) => {
      const before = text.slice(sofar.end, match.index);
      const stat = STAT_OF_WORD[match[0].toLowerCase()];
      return {
        parts: [
          ...sofar.parts,
          ...(before === "" ? [] : [before]),
          stat === undefined ? match[0] : { stat },
        ],
        end: match.index + match[0].length,
      };
    },
    { parts: [], end: 0 },
  );
  const rest = text.slice(split.end);
  return rest === "" ? split.parts : [...split.parts, rest];
}
