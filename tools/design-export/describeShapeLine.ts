import type { DesignShape } from "./DesignShape.ts";
import { textOfContent } from "./textOfContent.ts";

type ShapeDescriber = (
  shape: DesignShape,
  componentNames: ReadonlyMap<string, string>,
) => string | undefined;

const DESCRIBERS: ReadonlyArray<ShapeDescriber> = [
  describeHidden,
  describeComponent,
  describeText,
  describeFills,
  describeStrokes,
  describeRadius,
  describeLayout,
  describeTokens,
];

export function describeShapeLine(
  shape: DesignShape,
  board: DesignShape,
  componentNames: ReadonlyMap<string, string>,
): string {
  const position = `${shape.name} [${shape.type}] ${round(shape.width)}x${round(shape.height)} at ${round(shape.x - board.x)},${round(shape.y - board.y)}`;
  const details = DESCRIBERS.map((describe) => describe(shape, componentNames)).filter(
    (detail) => detail !== undefined,
  );
  return [position, ...details].join(" | ");
}

function describeHidden(shape: DesignShape): string | undefined {
  return shape.hidden === true ? "HIDDEN" : undefined;
}

function describeComponent(
  shape: DesignShape,
  componentNames: ReadonlyMap<string, string>,
): string | undefined {
  if (shape.componentId === undefined) {
    return undefined;
  }
  const main = shape.mainInstance === true ? " (main)" : "";
  return `component: ${componentNames.get(shape.componentId) ?? "unknown component"}${main}`;
}

function describeText(shape: DesignShape): string | undefined {
  const text = shape.type === "text" ? textOfContent(shape.content) : undefined;
  return text === undefined
    ? undefined
    : `text: "${text.text}" ${text.fontSize}px weight ${text.fontWeight} ${text.color}`;
}

function describeFills(shape: DesignShape): string | undefined {
  const fills = (shape.fills ?? []).map((fill) =>
    fill.fillImage === undefined ? `${fill.fillColor ?? "?"}${opacity(fill.fillOpacity)}` : "image",
  );
  return fills.length > 0 ? `fill: ${fills.join(", ")}` : undefined;
}

function describeStrokes(shape: DesignShape): string | undefined {
  const strokes = (shape.strokes ?? []).map(
    (stroke) => `${stroke.strokeColor ?? "?"} ${stroke.strokeWidth ?? 1}px`,
  );
  return strokes.length > 0 ? `stroke: ${strokes.join(", ")}` : undefined;
}

function describeRadius(shape: DesignShape): string | undefined {
  return shape.r1 !== undefined && shape.r1 > 0 ? `radius ${shape.r1}` : undefined;
}

function describeLayout(shape: DesignShape): string | undefined {
  if (shape.layout === undefined) {
    return undefined;
  }
  const alignment = `align ${shape.layoutAlignItems ?? "-"} justify ${shape.layoutJustifyContent ?? "-"}`;
  return `${shape.layout} ${shape.layoutFlexDir ?? ""} ${describeGap(shape)} ${describePadding(shape)} ${alignment}`;
}

function describeGap(shape: DesignShape): string {
  return `gap ${shape.layoutGap?.rowGap ?? 0}/${shape.layoutGap?.columnGap ?? 0}`;
}

function describePadding(shape: DesignShape): string {
  const padding = shape.layoutPadding;
  return `padding ${padding?.p1 ?? 0} ${padding?.p2 ?? 0} ${padding?.p3 ?? 0} ${padding?.p4 ?? 0}`;
}

function describeTokens(shape: DesignShape): string | undefined {
  const tokens = Object.entries(shape.appliedTokens ?? {});
  return tokens.length > 0
    ? `tokens: ${tokens.map(([property, token]) => `${property}=${token}`).join(", ")}`
    : undefined;
}

function round(value: number): number {
  return Math.round(value);
}

function opacity(value: number | undefined): string {
  return value === undefined || value === 1 ? "" : ` at ${Math.round(value * 100)}%`;
}
