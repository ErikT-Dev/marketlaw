import { readFileSync, writeFileSync } from "node:fs";
import { isRecord } from "../harness-check/isRecord.ts";
import { BOARD_VALUES } from "./BOARD_VALUES.ts";
import { DESIGN_EXPORT_PATHS } from "./DESIGN_EXPORT_PATHS.ts";

const TOKENS_CSS = "src/client/tokens.css";
const FONT_FACE = `@font-face {
  font-family: "Source Sans 3";
  font-style: normal;
  font-weight: 400 700;
  font-display: swap;
  src: url("./assets/fonts/SourceSans3-latin.woff2") format("woff2");
}`;
const BODY = `body {
  margin: 0;
  background: var(--color-background-game-window);
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-regular);
}`;
const FONT_FAMILY = '"Source Sans 3", "Source Sans Pro", system-ui, sans-serif';

type Token = { readonly path: ReadonlyArray<string>; readonly value: unknown };

function kebab(text: string): string {
  return text.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function collectTokens(group: unknown, path: ReadonlyArray<string>): ReadonlyArray<Token> {
  if (!isRecord(group)) {
    return [];
  }
  if ("$value" in group) {
    return [{ path, value: group["$value"] }];
  }
  return Object.entries(group).flatMap(([key, child]) => collectTokens(child, [...path, key]));
}

function cssName(collection: string, path: ReadonlyArray<string>): string {
  const prefix = collection.includes("colours") ? ["color"] : [];
  return `--${[...prefix, ...path].map(kebab).join("-")}`;
}

function cssValue(token: Token, names: ReadonlyMap<string, string>): string {
  const { value, path } = token;
  if (path.join(".") === "font.family.base") {
    return FONT_FAMILY;
  }
  const isNumber = typeof value === "number" || (typeof value === "string" && /^\d+$/.test(value));
  if (isNumber) {
    return path[0] === "font" && path[1] === "weight" ? String(value) : `${String(value)}px`;
  }
  const reference = typeof value === "string" ? /^\{(.+)\}$/.exec(value)?.[1] : undefined;
  if (reference !== undefined) {
    return `var(${names.get(reference) ?? reference})`;
  }
  return String(value).toLowerCase();
}

export function writeTokensCss(): void {
  const exported: unknown = JSON.parse(readFileSync(DESIGN_EXPORT_PATHS.tokens, "utf8"));
  const collections = isRecord(exported) ? Object.entries(exported) : [];
  const tokens = collections.flatMap(([collection, group]) =>
    collectTokens(group, []).map((token) => ({ ...token, name: cssName(collection, token.path) })),
  );
  const names = new Map(tokens.map((token) => [token.path.join("."), token.name]));
  const lines = [
    ...tokens.map((token) => `  ${token.name}: ${cssValue(token, names)};`),
    ...Object.entries(BOARD_VALUES).map(([name, value]) => `  ${name}: ${value};`),
  ].sort((a, b) => a.localeCompare(b));
  writeFileSync(TOKENS_CSS, `${FONT_FACE}\n\n:root {\n${lines.join("\n")}\n}\n\n${BODY}\n`);
}

writeTokensCss();
