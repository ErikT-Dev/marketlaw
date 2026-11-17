import * as v from "valibot";
import { TypeName } from "../../../shared/catalogue/TypeName";
import { joinParsed } from "./joinParsed";
import type { RulebookInline } from "./RulebookInline";
import type { RulebookParsed } from "./RulebookParsed";
import { statWordParts } from "./statWordParts";

const INLINE_MARKUP = /\*\*(.+?)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(#([^)]+)\)|`([^`]+)`/g;
const UNKNOWN_MARKUP = /[*`[\]_<>]/;

type Parts = RulebookParsed<ReadonlyArray<RulebookInline>>;

function plainParts(text: string): Parts {
  if (text === "") {
    return { value: [], problems: [] };
  }
  return UNKNOWN_MARKUP.test(text)
    ? { value: [text], problems: [`unknown inline syntax in "${text}"`] }
    : { value: statWordParts(text), problems: [] };
}

function typeParts(code: string): Parts {
  return v.is(TypeName, code)
    ? { value: [{ type: code }], problems: [] }
    : { value: [code], problems: [`inline code "${code}" names no type`] };
}

function wrappedParts(inner: Parts, wrap: (parts: ReadonlyArray<RulebookInline>) => RulebookInline) {
  return { value: [wrap(inner.value)], problems: inner.problems };
}

function markupParts(match: RegExpExecArray): Parts {
  const [, bold, italic, linkText, anchor, code] = match;
  if (bold !== undefined) {
    return wrappedParts(parseRulebookInline(bold), (parts) => ({ kind: "bold", parts }));
  }
  if (italic !== undefined) {
    return wrappedParts(parseRulebookInline(italic), (parts) => ({ kind: "italic", parts }));
  }
  if (linkText !== undefined && anchor !== undefined) {
    return wrappedParts(parseRulebookInline(linkText), (parts) => ({ kind: "link", anchor, parts }));
  }
  return typeParts(code ?? "");
}

export function parseRulebookInline(text: string): Parts {
  const matches = [...text.matchAll(INLINE_MARKUP)];
  const ends = matches.map((match) => match.index + match[0].length);
  const pieces = matches.flatMap((match, index) => [
    plainParts(text.slice(ends[index - 1] ?? 0, match.index)),
    markupParts(match),
  ]);
  return joinParsed([...pieces, plainParts(text.slice(ends.at(-1) ?? 0))]);
}
