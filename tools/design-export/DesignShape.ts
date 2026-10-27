export type DesignShape = Readonly<{
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  parentId?: string;
  hidden?: boolean;
  shapes?: ReadonlyArray<string>;
  componentId?: string;
  mainInstance?: boolean;
  fills?: ReadonlyArray<
    Readonly<{ fillColor?: string; fillOpacity?: number; fillImage?: unknown }>
  >;
  strokes?: ReadonlyArray<Readonly<{ strokeColor?: string; strokeWidth?: number }>>;
  r1?: number;
  layout?: string;
  layoutFlexDir?: string;
  layoutGap?: Readonly<{ rowGap?: number; columnGap?: number }>;
  layoutPadding?: Readonly<{ p1?: number; p2?: number; p3?: number; p4?: number }>;
  layoutAlignItems?: string;
  layoutJustifyContent?: string;
  appliedTokens?: Readonly<Record<string, string>>;
  content?: unknown;
}>;
