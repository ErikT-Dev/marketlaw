import { Combo } from "./combo"
import { Type } from "./gameTypes"
import { SectorTypes, TierTypes } from "./gameTypes"

export interface CardDataItem {
    cardId: number
    cardName: string
    cost: number
    imgName: string
    product: number
    quality: number
    sales: number
    satisfaction: number
    sector: SectorTypes
    tier: TierTypes
    workforce: number
    types: Type[]
    combos: Combo[]
}