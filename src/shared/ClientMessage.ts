export type ClientMessage =
  | { readonly protocolVersion: number; readonly type: "press" }
  | { readonly protocolVersion: number; readonly type: "resync" };
