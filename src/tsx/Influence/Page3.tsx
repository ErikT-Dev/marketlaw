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

type TradeAction = 'QforS' | 'SforQ' | 'PforS' | 'SSforP';

interface TradeOptionProps {
    action: TradeAction;
    influenceCost: number;
    fromStats: StatsTypes[];
    toStats: StatsTypes[];
    maxUses: number;
    isEnabled: boolean;
}

const TradeOption: React.FC<TradeOptionProps> = ({
    action,
    influenceCost,
    fromStats,
    toStats,
    maxUses,
    isEnabled,
}) => {
    const dispatch = useDispatch();
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);
    const usesRemaining = maxUses - playerStats.influenceUses[action];

    if (usesRemaining <= 0) return null;

    return (
        <MenuOption onSelect={() => {
            dispatch(trade(action));
            return false;
        }}>
            <View style={[
                repeatingElementsStyles.influenceOption,
                { backgroundColor: isEnabled ? '#1d1f57' : '#28283d' }
            ]}>
                <Text style={styles.optionText}>For {influenceCost} </Text>
                <GameIcon includePopup={false} stat={'influence'} />
                <Text style={styles.optionText}>: Trade </Text>
                {fromStats.map((stat, index) => (
                    <React.Fragment key={stat}>
                        {index > 0 && <Text style={styles.optionText}> and </Text>}
                        <Text style={styles.optionText}>1 </Text>
                        <GameIcon includePopup={false} stat={stat} />
                    </React.Fragment>
                ))}
                <Text style={styles.optionText}> for </Text>
                {toStats.map((stat, index) => (
                    <React.Fragment key={stat}>
                        {index > 0 && <Text style={styles.optionText}> and </Text>}
                        <Text style={styles.optionText}>1 </Text>
                        <GameIcon includePopup={false} stat={stat} />
                    </React.Fragment>
                ))}
                <Text style={styles.optionText}>  {formatUsesRemaining(usesRemaining)}</Text>
            </View>
        </MenuOption>
    );
};

export default function Page3() {
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);

    const tradeOptions: TradeOptionProps[] = [
        {
            action: 'QforS',
            influenceCost: 1,
            fromStats: ['quality'],
            toStats: ['satisfaction'],
            maxUses: 1,
            isEnabled: playerStats.quality > 0 && playerStats.influence > 0,
        },
        {
            action: 'SforQ',
            influenceCost: 1,
            fromStats: ['satisfaction'],
            toStats: ['quality'],
            maxUses: 1,
            isEnabled: playerStats.satisfaction > 0 && playerStats.influence > 0,
        },
        {
            action: 'PforS',
            influenceCost: 2,
            fromStats: ['product'],
            toStats: ['sales', 'satisfaction'],
            maxUses: 2,
            isEnabled: playerStats.product > 0 && playerStats.influence > 1,
        },
        {
            action: 'SSforP',
            influenceCost: 2,
            fromStats: ['sales', 'satisfaction'],
            toStats: ['product'],
            maxUses: 2,
            isEnabled: playerStats.sales > 0 && playerStats.satisfaction > 0 && playerStats.influence > 1,
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