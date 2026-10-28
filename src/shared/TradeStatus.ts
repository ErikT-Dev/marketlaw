import type { ReasonCode } from "./ReasonCode";
import type { TradeName } from "./TradeName";

export type TradeStatus = {
  readonly trade: TradeName;
  readonly rejection: ReasonCode | null;
};
