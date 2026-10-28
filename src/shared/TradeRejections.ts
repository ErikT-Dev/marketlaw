import type { ReasonCode } from "./ReasonCode";
import type { TradeName } from "./TradeName";

export type TradeRejections = Readonly<Record<TradeName, ReasonCode | null>>;
