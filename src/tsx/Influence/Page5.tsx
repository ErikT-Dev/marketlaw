import React from 'react';
import { MenuOption } from 'react-native-popup-menu';
import { Text, View, StyleSheet, TextStyle } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { PlayerStats } from '../../store/interfaces/playerStats';
import { repeatingElementsStyles } from '../../styleSheets/repeatingElements';
import { trade } from '../../store';
import { formatUsesRemaining } from '../../store/functions/formatUsesRemaining';
import GameIcon from '../Icons/GameIcon';
import { StatsTypes } from '../../store/interfaces/gameTypes';

interface TradeOptionProps {
    action: 'QforW' | 'SforW' | 'WforQ' | 'WforS';
    influenceCost: number;
    fromStat: StatsTypes;
    toStat: StatsTypes;
    isEnabled: boolean;
    usesRemaining: number;
}

const TradeOption: React.FC<TradeOptionProps> = ({
    action,
    influenceCost,
    fromStat,
    toStat,
    isEnabled,
    usesRemaining,
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
                {influenceCost > 0 && (
                    <>
                        <Text style={styles.optionText}>For {influenceCost} </Text>
                        <GameIcon includePopup={false} stat={'influence'} />
                        <Text style={styles.optionText}>: </Text>
                    </>
                )}
                <Text style={styles.optionText}>Trade 1 </Text>
                <GameIcon includePopup={false} stat={fromStat} />
                <Text style={styles.optionText}> for 1 </Text>
                <GameIcon includePopup={false} stat={toStat} />
                <Text style={styles.optionText}>  {formatUsesRemaining(usesRemaining)} </Text>
            </View>
        </MenuOption>
    );
};

export default function Page5() {
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);

    const tradeOptions: TradeOptionProps[] = [
        {
            action: 'QforW',
            influenceCost: 2,
            fromStat: 'quality',
            toStat: 'workforce',
            isEnabled: playerStats.quality > 0 && playerStats.influence > 1,
            usesRemaining: 1 - playerStats.influenceUses.QforW,
        },
        {
            action: 'SforW',
            influenceCost: 2,
            fromStat: 'satisfaction',
            toStat: 'workforce',
            isEnabled: playerStats.satisfaction > 0 && playerStats.influence > 1,
            usesRemaining: 1 - playerStats.influenceUses.SforW,
        },
        {
            action: 'WforQ',
            influenceCost: 0,
            fromStat: 'workforce',
            toStat: 'quality',
            isEnabled: playerStats.workforce > 0,
            usesRemaining: 1 - playerStats.influenceUses.WforQ,
        },
        {
            action: 'WforS',
            influenceCost: 0,
            fromStat: 'workforce',
            toStat: 'satisfaction',
            isEnabled: playerStats.workforce > 0,
            usesRemaining: 1 - playerStats.influenceUses.WforS,
        },
    ];

    return (
        <View>
            {tradeOptions.map((option) =>
                option.usesRemaining > 0 && (
                    <TradeOption key={option.action} {...option} />
                )
            )}
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