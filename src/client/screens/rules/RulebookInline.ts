import type { IconTextPart } from "../../components/IconTextPart";

export type RulebookInline =
  | IconTextPart
  | { readonly kind: "bold"; readonly parts: ReadonlyArray<RulebookInline> }
  | { readonly kind: "italic"; readonly parts: ReadonlyArray<RulebookInline> }
  | { readonly kind: "link"; readonly anchor: string; readonly parts: ReadonlyArray<RulebookInline> };
