import { isRecord } from "../harness-check/isRecord.ts";
import type { DesignShape } from "./DesignShape.ts";
import { describeShapeLine } from "./describeShapeLine.ts";

const ROOT_ID = "00000000-0000-0000-0000-000000000000";

export type DescribedDesignFile = Readonly<{
  markdown: string;
  boards: ReadonlyArray<Readonly<{ page: string; board: string }>>;
}>;

export function describeDesignFile(
  fileName: string,
  data: Readonly<Record<string, unknown>>,
  componentNames: ReadonlyMap<string, string>,
): DescribedDesignFile {
  const lines = [`# ${fileName}`, ""];
  const boards: Array<Readonly<{ page: string; board: string }>> = [];
  for (const page of pagesOf(data)) {
    const root = page.objects.get(ROOT_ID);
    const topLevel = (root?.shapes ?? [])
      .map((id) => page.objects.get(id))
      .filter((shape) => shape !== undefined)
      .sort((first, second) => first.y - second.y || first.x - second.x);
    lines.push(`## Page: ${page.name} (${page.objects.size - 1} shapes)`, "");
    for (const board of topLevel) {
      boards.push({ page: page.name, board: board.name });
      lines.push(
        `### ${board.name} (${Math.round(board.width)}x${Math.round(board.height)} at ${Math.round(board.x)},${Math.round(board.y)})`,
        "",
      );
      describeTree(board, board, page.objects, componentNames, 0, lines);
      lines.push("");
    }
  }
  return { markdown: lines.join("\n"), boards };
}

function describeTree(
  shape: DesignShape,
  board: DesignShape,
  objects: ReadonlyMap<string, DesignShape>,
  componentNames: ReadonlyMap<string, string>,
  depth: number,
  lines: Array<string>,
): void {
  lines.push(`${"  ".repeat(depth)}- ${describeShapeLine(shape, board, componentNames)}`);
  for (const childId of [...(shape.shapes ?? [])].reverse()) {
    const child = objects.get(childId);
    if (child !== undefined) {
      describeTree(child, board, objects, componentNames, depth + 1, lines);
    }
  }
}

function pagesOf(
  data: Readonly<Record<string, unknown>>,
): ReadonlyArray<Readonly<{ name: string; objects: ReadonlyMap<string, DesignShape> }>> {
  const order = data["pages"];
  const index = data["pagesIndex"];
  if (!Array.isArray(order) || !isRecord(index)) {
    return [];
  }
  return order.flatMap((pageId) => {
    const page = index[String(pageId)];
    if (!isRecord(page) || !isRecord(page["objects"])) {
      return [];
    }
    const objects = new Map(
      Object.entries(page["objects"]).filter((entry): entry is [string, DesignShape] =>
        isDesignShape(entry[1]),
      ),
    );
    return [{ name: String(page["name"]), objects }];
  });
}

function isDesignShape(value: unknown): value is DesignShape {
  return (
    isRecord(value) &&
    typeof value["id"] === "string" &&
    typeof value["type"] === "string" &&
    typeof value["name"] === "string"
  );
}
