import React from 'react';
import { MenuOption } from 'react-native-popup-menu';
import { Text, View, StyleSheet, TextStyle } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { PlayerStats } from '../../store/interfaces/playerStats';
import { repeatingElementsStyles } from '../../styleSheets/repeatingElements';
import { skipBuild, buyBuildPass, buyBuildPassWithInfluence, trade } from '../../store';
import { formatUsesRemaining } from '../../store/functions/formatUsesRemaining';
import GameIcon from '../Icons/GameIcon';

interface OptionProps {
    onSelect: () => void;
    isEnabled: boolean;
    children: React.ReactNode;
    usesRemaining?: number;
}

const Option: React.FC<OptionProps> = ({ onSelect, isEnabled, children, usesRemaining }) => (
    <MenuOption onSelect={onSelect}>
        <View style={[
            repeatingElementsStyles.influenceOption,
            { backgroundColor: isEnabled ? '#1d1f57' : '#28283d' }
        ]}>
            {children}
            {usesRemaining !== undefined && (
                <Text style={styles.optionText}>  {formatUsesRemaining(usesRemaining)}</Text>
            )}
        </View>
    </MenuOption>
);

export default function Page2() {
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);
    const dispatch = useDispatch();

    const options = [
        {
            action: () => dispatch(trade('FforI')),
            isEnabled: playerStats.funds > 0,
            content: (
                <>
                    <Text style={styles.optionText}>For 1 </Text>
                    <GameIcon includePopup={false} stat={'cost'} />
                    <Text style={styles.optionText}>: Gain 1 </Text>
                    <GameIcon includePopup={false} stat={'influence'} />
                </>
            ),
        },
        {
            action: () => dispatch(buyBuildPass()),
            isEnabled: playerStats.funds > 2 + playerStats.timesUsedBuildPass && playerStats.playedCardThisTurn && playerStats.buildPassesRemaining < 1,
            content: (
                <>
                    <Text style={styles.optionText}>For {2 + playerStats.timesUsedBuildPass} </Text>
                    <GameIcon includePopup={false} stat={'cost'} />
                    <Text style={styles.optionText}>: Gain Build Pass </Text>
                    <GameIcon includePopup={false} stat={'Has Build pass'} />
                </>
            ),
        },
        {
            action: () => dispatch(buyBuildPassWithInfluence()),
            isEnabled: playerStats.influence > 4 && playerStats.playedCardThisTurn && playerStats.buildPassesRemaining < 1,
            content: (
                <>
                    <Text style={styles.optionText}>For 5 </Text>
                    <GameIcon includePopup={false} stat={'influence'} />
                    <Text style={styles.optionText}>: Gain Build Pass </Text>
                    <GameIcon includePopup={false} stat={'Has Build pass'} />
                </>
            ),
            usesRemaining: 1 - playerStats.influenceUses.gainBP,
            showIf: playerStats.influenceUses.gainBP < 1,
        },
        {
            action: () => dispatch(skipBuild()),
            isEnabled: !playerStats.playedCardThisTurn && !playerStats.skippedBuildThisTurn,
            content: (
                <>
                    <Text style={styles.optionText}>Skip Build and gain a free Build Pass </Text>
                    <GameIcon includePopup={false} stat={'Has Build pass'} />
                </>
            ),
            usesRemaining: 3 - playerStats.influenceUses.skipBuildForBP,
            showIf: playerStats.influenceUses.skipBuildForBP < 3,
        },
    ];

    return (
        <View>
            {options.map((option, index) => (
                (option.showIf === undefined || option.showIf) && (
                    <Option
                        key={index}
                        onSelect={() => {
                            option.action();
                            return false;
                        }}
                        isEnabled={option.isEnabled}
                        usesRemaining={option.usesRemaining}
                    >
                        {option.content}
                    </Option>
                )
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