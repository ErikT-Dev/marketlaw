import { TypeValues } from "./gameTypes"

export interface UniqueDate {
    dateString: string
    medalsGiven: boolean
    bonusTypes: {
        type1: TypeValues
        bonusPoints1: number
        type2: TypeValues
        bonusPoints2: number
    }
}