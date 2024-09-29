import { RawCardDataItem } from '../interfaces/rawCardDataItem';
import { CardDataItem } from '../interfaces/cardDataItem';
import { Combo } from '../interfaces/combo';
import { Type } from "../interfaces/gameTypes";
import uuid from 'react-native-uuid';
import { TypeValues, isValidGainType, isValidTypeValue } from '../interfaces/gameTypes';

const tryFindCardId = (cardName: string, cardData: RawCardDataItem[]): number | null => {
    const card = cardData.find(e => e.cardName === cardName);
    return card ? card.cardId : null;
};

type OldComboKey = 'c1' | 'c2' | 'c3' | 'c4';

function processTypes(card: RawCardDataItem): Type[] {
    const typeFields = ['type1', 'type2', 'type3', 'type4', 'type5', 'doubleType1', 'doubleType2'];
    const typeCounts: { [key: string]: number } = {};

    typeFields.forEach(field => {
        const typeValue = card[field as keyof RawCardDataItem];
        if (typeof typeValue === 'string' && typeValue.trim() !== '') {
            typeCounts[typeValue] = (typeCounts[typeValue] || 0) + 1;
            if (field.startsWith('double')) {
                typeCounts[typeValue] += 1;
            }
        }
    });

    return Object.entries(typeCounts).map(([type, count]) => ({ type, count } as Type));
}

export function initializeCardData(cardData: RawCardDataItem[]): CardDataItem[] {
    return cardData.map(card => {
        const updatedCard: CardDataItem = {
            cardId: card.cardId,
            cardName: card.cardName,
            cost: card.cost,
            imgName: card.imgName,
            product: card.product,
            quality: card.quality,
            sales: card.sales,
            satisfaction: card.satisfaction,
            sector: card.sector,
            tier: card.tier,
            workforce: card.workforce,
            types: processTypes(card),
            combos: []
        };

        const oldKeys: OldComboKey[] = ['c1', 'c2', 'c3', 'c4'];

        oldKeys.forEach((oldKey) => {
            const reqType = card[`${oldKey}ReqType` as keyof RawCardDataItem];
            const gainsType = card[`${oldKey}GainsType` as keyof RawCardDataItem];

            if (typeof reqType === 'string' && reqType.trim() !== "" && typeof gainsType === 'string' && isValidGainType(gainsType)) {
                let validatedReqType: TypeValues | null = null;
                let reqCardId: number | null = null;

                if (isValidTypeValue(reqType)) {
                    validatedReqType = reqType;
                } else {
                    reqCardId = tryFindCardId(reqType, cardData);
                }

                const combo: Combo = {
                    comboId: uuid.v4().toString(),
                    complete: false,
                    reqN: card[`${oldKey}ReqN` as keyof RawCardDataItem] as number,
                    reqType: validatedReqType,
                    reqCard: reqCardId,
                    gainsN: card[`${oldKey}GainsN` as keyof RawCardDataItem] as number,
                    gainsType: gainsType,
                    infinite: card[`${oldKey}Infinite` as keyof RawCardDataItem] as boolean,
                    claims: 1,
                    infiniteReqTypeCount: 0,
                    regularReqTypeCount: 0
                };
                updatedCard.combos.push(combo);
            }
        });

        return updatedCard;
    });
}