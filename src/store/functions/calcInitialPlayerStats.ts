import { buildStartingDeckAndHand } from "./buildStartingDeckAndHand";
import { typesCalendar } from "../data";
import { PlayerStats } from "../interfaces/playerStats";
import { TypeCalendarItem } from "../interfaces/typeCalendarItem";

export function calcInitialPlayerStats(): PlayerStats {
    const currentDate = new Date().toLocaleString('en-GB', {
        dateStyle: 'medium',
        timeZone: 'Etc/GMT-8',
    });

    const foundBonusTypes = typesCalendar.find(date => date.date === currentDate);

    const defaultBonusTypes: TypeCalendarItem = {
        date: currentDate,
        type1: 'Beautification',
        bonusPoints1: 3,
        type2: 'Leisure',
        bonusPoints2: 2
    };

    const bonusTypes = foundBonusTypes || defaultBonusTypes

    const gameCards = buildStartingDeckAndHand()

    return {
        turnsPlayed: 0,
        funds: 7,
        influence: 0,
        workforce: 0,
        quality: 0,
        satisfaction: 0,
        product: 0,
        sales: 0,
        income: 3,
        bonus: 0,
        gameCards: gameCards,
        displayedCard: gameCards.find(e => e.location === "Hand") || null,
        types: [],
        playedCombos: [],
        influenceUses: {
            SSforP: 0,
            PforS: 0,
            QforW: 0,
            SforW: 0,
            QforS: 0,
            SforQ: 0,
            WforQ: 0,
            WforS: 0,
            gain1Q: 0,
            gain1S: 0,
            gain1W: 0,
            gain2F: 0,
            gainBP: 0,
            skipBuildForBP: 0
        },
        tierData: {
            Residential1: 0,
            Residential2: 0,
            Residential3: 0,
            Public1: 0,
            Public2: 0,
            Public3: 0,
            Industry1: 0,
            Industry2: 0,
            Industry3: 0,
            Service1: 0,
            Service2: 0,
            Service3: 0,
        },
        playedCardThisTurn: false,
        skippedBuildThisTurn: false,
        gameRunning: false,
        timesUsedBuildPass: 0,
        hasBuildPassCurrently: false,
        buildPassesRemaining: 0,
        projects: [
            {
                projectId: 1,
                complete: false,
                projectName: 'Fight Against Homelessness',
                costType: 'workforce',
                costCount: 8
            },
            {
                projectId: 2,
                complete: false,
                projectName: 'Culture Campaign',
                costType: 'satisfaction',
                costCount: 8
            },
            {
                projectId: 3,
                complete: false,
                projectName: 'Clean Up The City',
                costType: 'quality',
                costCount: 8
            }
        ],
        gameDate: currentDate,
        playedBonusTypes: {
            bonusType1: bonusTypes.type1,
            playedType1: 0,
            baseRewardOfType1: bonusTypes.bonusPoints1,
            bonusType2: bonusTypes.type2,
            playedType2: 0,
            baseRewardOfType2: bonusTypes.bonusPoints2,
            totalReceivedReward: 0
        }
    };
}