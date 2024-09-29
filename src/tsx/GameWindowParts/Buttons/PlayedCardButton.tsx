import React from 'react';
import { Text, Pressable, ViewStyle, TextStyle } from 'react-native';
import { turnToRomanNumerals } from '../../../store/functions/turnToRomanNumerals';
import { useDispatch } from 'react-redux';
import { cardStyles } from '../../../styleSheets/card';
import { setDisplayedCard } from '../../../store';
import { GameCard } from '../../../store/interfaces/cardInAction';

interface PlayedCardProps {
    card: GameCard;
}

const sectorColors: Record<string, string> = {
    Public: 'rgba(78, 90, 173,0.5)',
    Residential: 'rgba(61, 110, 52, 0.5)',
    Service: 'rgba(184, 136, 6, 0.5)',
    Industry: 'rgba(158, 72, 57,0.5)',
};

export default function PlayedCard({ card }: PlayedCardProps) {
    const dispatch = useDispatch();
    const { sector, tier } = card;
    const textToDisplay = turnToRomanNumerals(tier);

    const containerStyle: ViewStyle = {
        ...cardStyles.playedCardBody,
        backgroundColor: sectorColors[sector] || 'rgba(0, 0, 0, 0.5)'
    };

    const textStyle: TextStyle = {
        ...cardStyles.playedCardText,
    };

    const handlePress = () => dispatch(setDisplayedCard(card));

    return (
        <Pressable onPress={handlePress} style={containerStyle}>
            <Text adjustsFontSizeToFit style={textStyle}>
                {textToDisplay}
            </Text>
        </Pressable>
    );
}