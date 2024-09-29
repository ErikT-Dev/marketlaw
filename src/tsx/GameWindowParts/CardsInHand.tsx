import React, { useState, useMemo } from 'react';
import { Text, View, Pressable, ScrollView, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import CardInHandButton from './Buttons/CardInHandButton';
import { PlayerStats } from '../../store/interfaces/playerStats';
import { buttonsStyles } from '../../styleSheets/buttons';
import StatText from '../StylingElements/StatText';
import GameIcon from '../Icons/GameIcon';

const CardsInHand: React.FC = () => {
    const [sellingActivated, setSellingActivated] = useState(false);
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);

    const cardsInHand = useMemo(() =>
        playerStats.gameCards
            .filter(e => e.location === "Hand")
            .sort((a, b) => a.cardId - b.cardId),
        [playerStats.gameCards]);

    const toggleSelling = () => setSellingActivated(prev => !prev);

    const buttonStyle = (pressed: boolean) => [
        buttonsStyles.statButton,
        {
            flexDirection: 'row',
            backgroundColor: sellingActivated
                ? pressed ? '#deae40' : '#d49400'
                : pressed ? '#7a5a9e' : '#623f8a'
        }
    ] as ViewStyle;

    return (
        <View style={{ width: '30%', justifyContent: 'flex-start' }}>
            <Pressable style={({ pressed }) => buttonStyle(pressed)} onPress={toggleSelling}>
                <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 13, color: 'white', fontWeight: "600" }}>
                    {sellingActivated ? 'SELL ' : 'HAND '}
                </Text>
                <View style={{ flexDirection: "row" }}>
                    <GameIcon includePopup={false} stat={'Cards in hand'} />
                    <StatText stat={'influence'} text={` ${cardsInHand.length}`} />
                </View>
            </Pressable>
            <ScrollView>
                {cardsInHand.map((card) => (
                    <CardInHandButton
                        key={card.cardId}
                        cardInHand={card}
                        sellingActivated={sellingActivated}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

export default React.memo(CardsInHand);