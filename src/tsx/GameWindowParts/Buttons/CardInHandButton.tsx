import React from 'react';
import { Text, Pressable, ViewStyle } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { checkCombosForCompletion, playCard, sellCard, setDisplayedCard, updateCombosCount, updatePlayedBonusTypes } from '../../../store';
import { PlayerStats } from '../../../store/interfaces/playerStats';
import { cardStyles } from '../../../styleSheets/card';
import { GameCard } from '../../../store/interfaces/cardInAction';

interface CardInHandProps {
    cardInHand: GameCard;
    sellingActivated: boolean;
}

const sectorColors: Record<string, { base: string, pressed: string, t1: string, t2: string, t3: string }> = {
    Public: { base: 'rgba(78, 90, 173,0.8)', pressed: 'rgba(109, 116, 179, 0.6)', t1: 'rgba(78, 90, 173,0.8)', t2: 'rgba(35, 48, 145,0.8)', t3: 'rgba(3, 15, 94,0.6)' },
    Residential: { base: 'rgba(61, 110, 52, 0.8)', pressed: 'rgba(88, 138, 76, 0.6)', t1: 'rgba(61, 110, 52, 0.8)', t2: 'rgba(23, 69, 15, 0.8)', t3: 'rgba(11, 43, 3, 0.6)' },
    Service: { base: 'rgba(184, 136, 6, 0.8)', pressed: 'rgba(214, 164, 39, 0.6)', t1: 'rgba(184, 136, 6, 0.8)', t2: 'rgba(138, 97, 14, 0.8)', t3: 'rgba(135, 83, 0, 0.6)' },
    Industry: { base: 'rgba(158, 72, 57,0.8)', pressed: 'rgba(171, 85, 70, 0.6)', t1: 'rgba(158, 72, 57,0.8)', t2: 'rgba(107, 36, 25,0.8)', t3: 'rgba(48, 8, 0,0.6)' },
};

export default function CardInHandButton({ cardInHand, sellingActivated }: CardInHandProps) {
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);
    const dispatch = useDispatch();

    const { sector, tier, cardName, cost } = cardInHand;
    const tierTax = playerStats.tierData[`${sector}${tier}`];
    const colors = sectorColors[sector];

    const getBackgroundColor = (pressed: boolean): string =>
        pressed ? colors.pressed : colors[`t${tier}` as keyof typeof colors];

    const getBorderStyle = (): ViewStyle => ({
        borderColor: sellingActivated ? '#d6be7a' : cardInHand.newInHand ? '#acb3e3' : 'black',
        borderRadius: sellingActivated || cardInHand.newInHand ? 4 : 2,
    });

    const handlePress = () => dispatch(sellingActivated ? sellCard(cardInHand) : setDisplayedCard(cardInHand));
    const handleLongPress = () => {
        dispatch(playCard(cardInHand));
        dispatch(checkCombosForCompletion());
        dispatch(updateCombosCount());
        dispatch(updatePlayedBonusTypes());
    };

    return (
        <Pressable
            onPress={handlePress}
            onLongPress={handleLongPress}
            style={({ pressed }) => [
                cardStyles.cardBody,
                { backgroundColor: getBackgroundColor(pressed) },
                getBorderStyle()
            ]}
        >
            <Text adjustsFontSizeToFit style={cardStyles.cardText}>
                ${cost + tierTax} {cardName}
            </Text>
        </Pressable>
    );
}