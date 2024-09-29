import { Combo } from "./combo"
import { SectorTypes, TierTypes } from "./gameTypes"

export interface RawCardDataItem {
    c1GainsN: number
    c1GainsType: string
    c1Infinite: boolean
    c1ReqN: number
    c1ReqType: string
    c2GainsN: number
    c2GainsType: string
    c2Infinite: boolean
    c2ReqN: number
    c2ReqType: string
    c3GainsN: number
    c3GainsType: string
    c3Infinite: boolean
    c3ReqN: number
    c3ReqType: string
    c4GainsN: number
    c4GainsType: string
    c4Infinite: boolean
    c4ReqN: number
    c4ReqType: string
    cardId: number
    cardName: string
    cost: number
    doubleType1: string
    doubleType2: string
    imgName: string
    product: number
    quality: number
    sales: number
    satisfaction: number
    sector: SectorTypes
    tier: TierTypes
    type1: string
    type2: string
    type3: string
    type4: string
    type5: string
    workforce: number
    combo1: Combo
    combo2: Combo
    combo3: Combo
    combo4: Combo
}