import { GameCard } from "../interfaces/cardInAction";
import { cardData, cardDrawAlgo } from "../data";
import { SectorTypes, TierTypes } from "../interfaces/gameTypes";
import { showMessage, hideMessage } from "react-native-flash-message";

interface DrawCardsOptions {
    allCards: GameCard[];
    numberToDraw: number;
    turnsPlayed: number;
    sectorToDrawFrom?: SectorTypes | "Random";
    tierToDrawFrom?: TierTypes | "Random";
    publicCardType?: "Quality" | "Satisfaction" | "Any";
}

export function drawCards({
    allCards,
    numberToDraw,
    turnsPlayed,
    sectorToDrawFrom = "Random",
    tierToDrawFrom = "Random",
    publicCardType = "Any"
}: DrawCardsOptions): GameCard[] {
    const drawnCards: GameCard[] = [];

    while (drawnCards.length < numberToDraw) {
        const sector = sectorToDrawFrom === "Random" ? getRandomSector() : sectorToDrawFrom;
        const tier = tierToDrawFrom === "Random" ? getRandomTier(turnsPlayed) : tierToDrawFrom;

        let eligibleCards = getEligibleCards(allCards, sector, tier, publicCardType);

        if (eligibleCards.length === 0 && sectorToDrawFrom !== "Random") {

            eligibleCards = getEligibleCards(allCards, sector, "Random", publicCardType);
        }

        if (eligibleCards.length === 0) {
            eligibleCards = getEligibleCards(allCards, "Random", "Random", "Any");
            showMessage({
                message: "The deck you chose has run out of cards. Now drawing random cards instead.",
                type: "warning",
                onPress: () => hideMessage()
            })
        }

        if (eligibleCards.length === 0) {
            showMessage({
                message: "Failed to draw a card because the deck has run out of cards.",
                type: "danger",
                onPress: () => hideMessage()
            })
            break;
        }

        const randomIndex = Math.floor(Math.random() * eligibleCards.length);
        const drawnCard = eligibleCards[randomIndex];

        const cardIndex = allCards.findIndex(card => card.cardId === drawnCard.cardId);
        if (cardIndex !== -1) {
            allCards[cardIndex].location = "Hand";
            allCards[cardIndex].newInHand = true;
            drawnCards.push(allCards[cardIndex]);
        }
    }

    if (drawnCards.length < numberToDraw) {
        showMessage({
            message: "Failed to draw a card because the deck has run out of cards.",
            type: "danger",
            onPress: () => hideMessage()
        })
    }

    return allCards;
}

function getEligibleCards(
    allCards: GameCard[],
    sector: SectorTypes | "Random",
    tier: TierTypes | "Random",
    publicCardType: "Quality" | "Satisfaction" | "Any"
): GameCard[] {
    return allCards.filter(card => {
        if (card.location !== "Deck") return false;

        if (sector !== "Random" && sector !== card.sector) return false;
        if (tier !== "Random" && tier !== card.tier) return false;

        if (sector === "Public" && publicCardType !== "Any") {
            const cardInfo = cardData.find(c => c.cardId === card.cardId);
            if (!cardInfo) return false;
            if (publicCardType === "Quality" && cardInfo.quality <= cardInfo.satisfaction) return false;
            if (publicCardType === "Satisfaction" && cardInfo.quality > cardInfo.satisfaction) return false;
        }

        return true;
    });
}

function getRandomSector(): SectorTypes {
    const sectors: SectorTypes[] = ["Residential", "Industry", "Service", "Public"];
    return sectors[Math.floor(Math.random() * sectors.length)];
}

function getRandomTier(turnsPlayed: number): TierTypes {
    const random = Math.random();
    const tier1Chance = random < cardDrawAlgo.tier1Start - turnsPlayed / cardDrawAlgo.tier1Modifier;
    const tier3Chance = random > cardDrawAlgo.tier3Start - turnsPlayed / cardDrawAlgo.tier3Modifier;
    return tier1Chance ? 1 : tier3Chance ? 3 : 2;
}