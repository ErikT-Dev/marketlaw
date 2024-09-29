import React from 'react';
import { MenuOption } from 'react-native-popup-menu';
import { Text, View, TextStyle, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { PlayerStats } from '../../store/interfaces/playerStats';
import { repeatingElementsStyles } from '../../styleSheets/repeatingElements';
import { gainViaInfluence } from '../../store';
import { formatUsesRemaining } from '../../store/functions/formatUsesRemaining';
import GameIcon from '../Icons/GameIcon';
import { StatsTypes } from '../../store/interfaces/gameTypes';

type GainViaInfluenceAction = 'gain2F' | 'gain1Q' | 'gain1S' | 'gain1W';

interface GainViaInfluenceOptionProps {
    action: GainViaInfluenceAction;
    cost: number;
    gainAmount: number;
    gainStat: StatsTypes;
    maxUses: number;
    usesRemaining: number;
    isEnabled: boolean;
}

const GainViaInfluenceOption: React.FC<GainViaInfluenceOptionProps> = ({
    action,
    cost,
    gainAmount,
    gainStat,
    usesRemaining,
    isEnabled,
}) => {
    const dispatch = useDispatch();

    return (
        <MenuOption onSelect={() => {
            dispatch(gainViaInfluence(action));
            return false;
        }}>
            <View style={[
                repeatingElementsStyles.influenceOption,
                { backgroundColor: isEnabled ? '#1d1f57' : '#28283d' }
            ]}>
                <Text style={styles.optionText}>For {cost} </Text>
                <GameIcon includePopup={false} stat={'influence'} />
                <Text style={styles.optionText}>: Gain {gainAmount} </Text>
                <GameIcon includePopup={false} stat={gainStat} />
                <Text style={styles.optionText}>  {formatUsesRemaining(usesRemaining)} </Text>
            </View>
        </MenuOption>
    );
};

export default function Page1() {
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);

    const options: Array<{
        action: GainViaInfluenceAction;
        cost: number;
        gainAmount: number;
        gainStat: StatsTypes;
        maxUses: number;
    }> = [
            { action: 'gain2F', cost: 4, gainAmount: 2, gainStat: 'cost', maxUses: 1 },
            { action: 'gain1Q', cost: 4, gainAmount: 1, gainStat: 'quality', maxUses: 1 },
            { action: 'gain1S', cost: 4, gainAmount: 1, gainStat: 'satisfaction', maxUses: 1 },
            { action: 'gain1W', cost: 6, gainAmount: 1, gainStat: 'workforce', maxUses: 1 },
        ];

    return (
        <View>
            {options.map(option => {
                const usesRemaining = option.maxUses - playerStats.influenceUses[option.action];
                if (usesRemaining <= 0) return null;

                return (
                    <GainViaInfluenceOption
                        key={option.action}
                        {...option}
                        usesRemaining={usesRemaining}
                        isEnabled={playerStats.influence >= option.cost}
                    />
                );
            })}
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