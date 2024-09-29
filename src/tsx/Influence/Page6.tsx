import React from 'react';
import { MenuOption } from 'react-native-popup-menu';
import { Text, View, StyleSheet, TextStyle } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { PlayerStats } from '../../store/interfaces/playerStats';
import { repeatingElementsStyles } from '../../styleSheets/repeatingElements';
import { trade } from '../../store';
import GameIcon from '../Icons/GameIcon';
import { StatsTypes } from '../../store/interfaces/gameTypes';

interface TradeOptionProps {
    action: 'Sfor2Q' | 'Qfor2S' | 'Wfor4Q' | 'Wfor4S';
    fromStat: StatsTypes;
    toStat: StatsTypes;
    fromAmount: number;
    toAmount: number;
    isEnabled: boolean;
}

const TradeOption: React.FC<TradeOptionProps> = ({
    action,
    fromStat,
    toStat,
    fromAmount,
    toAmount,
    isEnabled,
}) => {
    const dispatch = useDispatch();

    return (
        <MenuOption onSelect={() => {
            dispatch(trade(action));
            return false;
        }}>
            <View style={[
                repeatingElementsStyles.influenceOption,
                { backgroundColor: isEnabled ? '#1d1f57' : '#28283d' }
            ]}>
                <Text style={styles.optionText}>Trade {fromAmount} </Text>
                <GameIcon includePopup={false} stat={fromStat} />
                <Text style={styles.optionText}> for {toAmount} </Text>
                <GameIcon includePopup={false} stat={toStat} />
            </View>
        </MenuOption>
    );
};

export default function Page6() {
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);

    const tradeOptions: TradeOptionProps[] = [
        {
            action: 'Sfor2Q',
            fromStat: 'quality',
            toStat: 'satisfaction',
            fromAmount: 2,
            toAmount: 1,
            isEnabled: playerStats.quality > 1,
        },
        {
            action: 'Qfor2S',
            fromStat: 'satisfaction',
            toStat: 'quality',
            fromAmount: 2,
            toAmount: 1,
            isEnabled: playerStats.satisfaction > 1,
        },
        {
            action: 'Wfor4Q',
            fromStat: 'quality',
            toStat: 'workforce',
            fromAmount: 4,
            toAmount: 1,
            isEnabled: playerStats.quality > 3,
        },
        {
            action: 'Wfor4S',
            fromStat: 'satisfaction',
            toStat: 'workforce',
            fromAmount: 4,
            toAmount: 1,
            isEnabled: playerStats.satisfaction > 3,
        },
    ];

    return (
        <View>
            {tradeOptions.map((option) => (
                <TradeOption key={option.action} {...option} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    optionText: {
        fontSize: 14,
        color: '#d5edf2',
        fontWeight: '500',
    } as TextStyle,
});