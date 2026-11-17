import type { RulebookBlock } from "./RulebookBlock";
import type { RulebookInline } from "./RulebookInline";

function anchorsInParts(parts: ReadonlyArray<RulebookInline>): ReadonlyArray<string> {
  return parts.flatMap((part) => {
    if (typeof part === "string" || !("kind" in part)) {
      return [];
    }
    const inner = anchorsInParts(part.parts);
    return part.kind === "link" ? [part.anchor, ...inner] : inner;
  });
}

function partsOfBlock(block: RulebookBlock): ReadonlyArray<ReadonlyArray<RulebookInline>> {
  switch (block.kind) {
    case "paragraph":
      return [block.parts];
    case "list":
      return block.items;
    case "table":
      return [...block.header, ...block.rows.flat()];
    case "preformatted":
      return [];
    default: {
      const unknownBlock: never = block;
      return unknownBlock;
    }
  }
}

export function linkAnchorsIn(blocks: ReadonlyArray<RulebookBlock>): ReadonlyArray<string> {
  return blocks.flatMap(partsOfBlock).flatMap(anchorsInParts);
}
