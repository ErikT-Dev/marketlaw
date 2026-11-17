import type { IconTextPart } from "../../components/IconTextPart";
import type { RulebookInline } from "./RulebookInline";

export type RulebookBlock =
  | { readonly kind: "paragraph"; readonly parts: ReadonlyArray<RulebookInline> }
  | {
      readonly kind: "list";
      readonly isOrdered: boolean;
      readonly items: ReadonlyArray<ReadonlyArray<RulebookInline>>;
    }
  | {
      readonly kind: "table";
      readonly header: ReadonlyArray<ReadonlyArray<RulebookInline>>;
      readonly rows: ReadonlyArray<ReadonlyArray<ReadonlyArray<RulebookInline>>>;
    }
  | { readonly kind: "preformatted"; readonly lines: ReadonlyArray<ReadonlyArray<IconTextPart>> };
