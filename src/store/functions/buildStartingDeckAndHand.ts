import { GameCard } from "../interfaces/cardInAction";
import { drawCards } from "./drawCards";
import { cardData } from "../data";
import { SectorTypes, TierTypes } from "../interfaces/gameTypes";

export function buildStartingDeckAndHand(): GameCard[] {

    let allCards: GameCard[] = cardData.map(card => ({
        cardId: card.cardId,
        cardName: card.cardName,
        location: "Deck",
        newInHand: false,
        sector: card.sector as SectorTypes,
        tier: card.tier as TierTypes,
        cost: card.cost
    }));

    const drawSingleCard = (sectorToDrawFrom: SectorTypes | "Random", tierToDrawFrom: TierTypes | "Random") => {
        allCards = drawCards({
            allCards,
            numberToDraw: 1,
            turnsPlayed: 0,
            sectorToDrawFrom,
            tierToDrawFrom
        });
    };

    const sectors: SectorTypes[] = ["Residential", "Industry", "Service", "Public"];
    sectors.forEach(sector => {
        drawSingleCard(sector, 1);
    });

    drawSingleCard("Random", 1);

    drawSingleCard("Random", Math.random() < 0.5 ? 1 : 2);

    drawSingleCard("Random", "Random");

    allCards = allCards.map(card => ({
        ...card,
        newInHand: card.location === "Hand" ? false : card.newInHand
    }));

    return allCards;
}