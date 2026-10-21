export type ServerMessage = {
  readonly protocolVersion: number;
  readonly type: "pressCount";
  readonly version: number;
  readonly pressCount: number;
};
