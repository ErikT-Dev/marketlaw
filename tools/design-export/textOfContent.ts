import { isRecord } from "../harness-check/isRecord.ts";

export type TextStyle = Readonly<{
  text: string;
  fontSize: string;
  fontWeight: string;
  color: string;
}>;

export function textOfContent(content: unknown): TextStyle | undefined {
  const leaves: Array<Readonly<Record<string, unknown>>> = [];
  const paragraphs: Array<string> = [];
  collectParagraphs(content, leaves, paragraphs);
  const first = leaves[0];
  if (first === undefined) {
    return undefined;
  }
  const fills = first["fills"];
  const firstFill: unknown = Array.isArray(fills) ? fills[0] : undefined;
  return {
    text: paragraphs.join(" / "),
    fontSize: plainText(first["fontSize"]),
    fontWeight: plainText(first["fontWeight"]),
    color: isRecord(firstFill) ? plainText(firstFill["fillColor"]) : "",
  };
}

function collectParagraphs(
  node: unknown,
  leaves: Array<Readonly<Record<string, unknown>>>,
  paragraphs: Array<string>,
): void {
  if (!isRecord(node)) {
    return;
  }
  const children = node["children"];
  if (node["type"] === "paragraph" && Array.isArray(children)) {
    const parts = children.filter(isRecord);
    leaves.push(...parts);
    paragraphs.push(parts.map((part) => plainText(part["text"])).join(""));
    return;
  }
  if (Array.isArray(children)) {
    for (const child of children) {
      collectParagraphs(child, leaves, paragraphs);
    }
  }
}

function plainText(value: unknown): string {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}
