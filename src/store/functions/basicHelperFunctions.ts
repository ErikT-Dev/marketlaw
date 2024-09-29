import { cardData } from "../data"
import { GameCard } from "../interfaces/cardInAction"
import { TierData } from "../interfaces/tierData"
import { CardSectorAndTier } from "../interfaces/gameTypes"

export function calcWorkforce(currentWorkforce: number, playedCard: GameCard) {
    if (playedCard.sector !== 'Residential') { return currentWorkforce - cardData[playedCard.cardId - 1].workforce }
    else { return currentWorkforce + cardData[playedCard.cardId - 1].workforce }
}

export function calcQuality(currentQuality: number, playedCard: GameCard) {
    if (playedCard.sector !== 'Public') { return currentQuality - cardData[playedCard.cardId - 1].quality }
    else { return currentQuality + cardData[playedCard.cardId - 1].quality }
}

export function calcSatisfaction(currentSatisfaction: number, playedCard: GameCard) {
    if (playedCard.sector !== 'Public') { return currentSatisfaction - cardData[playedCard.cardId - 1].satisfaction }
    else { return currentSatisfaction + cardData[playedCard.cardId - 1].satisfaction }
}

export function calcTierTax(currentTierData: TierData, playedCard: GameCard) {
    let cardSectorAndTier = `${playedCard.sector}${playedCard.tier}` as CardSectorAndTier
    let tierTax = currentTierData[cardSectorAndTier]
    return tierTax
}

export function updateTierData(currentTierData: TierData, playedCard: GameCard) {
    let cardSectorAndTier = `${playedCard.sector}${playedCard.tier}` as CardSectorAndTier
    currentTierData[cardSectorAndTier] += 1
    return currentTierData
}