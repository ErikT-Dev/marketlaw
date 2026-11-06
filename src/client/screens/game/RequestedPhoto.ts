import type { CardName } from "../../../shared/catalogue/CardName";

export type RequestedPhoto = { readonly card: CardName; readonly decoding: Promise<unknown> };
