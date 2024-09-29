import React, { useMemo, useCallback } from 'react';
import { Text, View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { Menu, MenuOptions, MenuOption, MenuTrigger, renderers, MenuOptionsCustomStyle } from 'react-native-popup-menu';
import { HighScore } from '../../store/interfaces/highScore';
import { UniqueDate } from '../../store/interfaces/uniqueDate';
import { findDataForGamesOfThatDate } from '../../store/functions/findDataForGamesOfThatDate';
import { parseLocaleDateString } from '../../store/functions/parseLocaleDateString';
import GameIcon from '../Icons/GameIcon';

interface DateSelectorProps {
    onSelect: (date: string) => void;
    selectedDate: string | undefined;
}

const DateSelector: React.FC<DateSelectorProps> = ({ onSelect, selectedDate }) => {
    const playedDates = useSelector((state: any) => state.fireStoreDB.allGamesData.dates as UniqueDate[]);
    const playedGames = useSelector((state: any) => state.fireStoreDB.allGamesData.games as HighScore[]);

    const sortedDates = useMemo(() =>
        [...playedDates].sort((a, b) => parseLocaleDateString(b.dateString) - parseLocaleDateString(a.dateString)),
        [playedDates]);

    const renderDateOption = useCallback((date: UniqueDate) => {
        const isSelected = selectedDate === date.dateString;
        const gamesCount = findDataForGamesOfThatDate(date.dateString, 'gamesCount', playedGames);
        const highestScorePlayer = findDataForGamesOfThatDate(date.dateString, 'playerWithHighestScore', playedGames);
        const highestScore = findDataForGamesOfThatDate(date.dateString, 'highestScore', playedGames);

        return (
            <MenuOption key={date.dateString} onSelect={() => onSelect(date.dateString)}>
                <View style={[styles.dateOption, isSelected && styles.selectedDateOption]}>
                    <View>
                        <Text style={styles.dateText}>{date.dateString} - {gamesCount} games</Text>
                        <Text style={styles.scoreText}>{highestScorePlayer} ({highestScore} pts)</Text>
                    </View>
                    <View style={styles.bonusContainer}>
                        <Text style={styles.bonusText}>{date.bonusTypes.bonusPoints1}</Text>
                        <GameIcon includePopup={false} stat={date.bonusTypes.type1} />
                        <Text style={styles.bonusText}>{date.bonusTypes.bonusPoints2}</Text>
                        <GameIcon includePopup={false} stat={date.bonusTypes.type2} />
                    </View>
                </View>
            </MenuOption>
        );
    }, [selectedDate, playedGames, onSelect]);

    return (
        <Menu renderer={renderers.SlideInMenu}>
            <MenuTrigger>
                <View style={styles.triggerButton}>
                    <Text style={styles.triggerText}>{selectedDate || 'Select a Date'}</Text>
                </View>
            </MenuTrigger>
            <MenuOptions customStyles={menuCustomStyles}>
                <ScrollView>
                    {sortedDates.map(renderDateOption)}
                </ScrollView>
            </MenuOptions>
        </Menu>
    );
};

const styles = StyleSheet.create({
    triggerButton: {
        backgroundColor: '#691403',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 7,
        height: '100%',
        width: 120,
    },
    triggerText: {
        color: 'white',
        textDecorationLine: 'underline',
    },
    dateOption: {
        backgroundColor: '#472634',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 7,
        paddingHorizontal: 10,
        marginBottom: 2,
        flexDirection: 'row',
        borderBottomRightRadius: 10,
    },
    selectedDateOption: {
        backgroundColor: '#740535',
    },
    dateText: {
        color: '#eeb998',
        fontSize: 16,
    },
    scoreText: {
        color: '#c4ffd2',
        fontSize: 12,
    },
    bonusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bonusText: {
        fontFamily: 'sans-serif-condensed',
        fontSize: 17,
        fontWeight: '500',
        color: '#fffebb',
    },
});

const menuCustomStyles = {
    optionWrapper: { padding: 1 },
    optionsContainer: {
        width: '40%',
        height: '100%',
        padding: 10,
        backgroundColor: 'rgba(214, 97, 115, 0.92)',
        borderWidth: 1,
        borderColor: 'black',
    },
} as MenuOptionsCustomStyle;

export default React.memo(DateSelector);