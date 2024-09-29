import React, { useMemo, useCallback } from 'react';
import { Text, View, ScrollView, StyleSheet } from 'react-native';
import { Menu, MenuOptions, MenuOption, MenuTrigger, MenuOptionsCustomStyle } from 'react-native-popup-menu';
import StatText from '../StylingElements/StatText';
import { repeatingElementsStyles } from '../../styleSheets/repeatingElements';
import { HighScore } from '../../store/interfaces/highScore';
import GameIcon from '../Icons/GameIcon';
import { Type } from "../../store/interfaces/gameTypes";
import { HighScoreStatsTypes } from '../../store/interfaces/gameTypes';

interface DisplayedGamesProps {
    displayedScores: HighScore[];
    selectedView: 'allGamesOfSelectedDate' | 'playerRankings' | 'allGamesOfSelectedPlayer';
}

const DisplayedGames: React.FC<DisplayedGamesProps> = ({ displayedScores, selectedView }) => {
    const mostRecentGame = useMemo(() => {
        return displayedScores.length > 0
            ? displayedScores.reduce((acc, curr) =>
                Date.parse(acc.dateAndTimeUTC) > Date.parse(curr.dateAndTimeUTC) ? acc : curr
            )
            : null;
    }, [displayedScores]);

    const sortedScores = useMemo(() =>
        [...displayedScores].sort((a, b) => b.score - a.score),
        [displayedScores]);

    const renderTypes = useCallback((types: Type[], excludeTypes: string[]) => {
        return types
            .filter(type => !excludeTypes.includes(type.type))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map((type, index) => (
                <View key={index} style={repeatingElementsStyles.typesCell}>
                    <GameIcon includePopup={false} stat={type.type} />
                    <StatText stat='basic' text={`${type.count}`} />
                </View>
            ));
    }, []);

    const renderGameRow = useCallback((game: HighScore, index: number) => {
        const isTopScore = index === 0;
        const isMostRecent = selectedView === 'allGamesOfSelectedPlayer' && mostRecentGame && game.gameId === mostRecentGame.gameId;

        return (
            <View key={game.gameId}>
                <View style={[
                    styles.gameHeader,
                    isTopScore && styles.topScoreHeader,
                    isMostRecent && styles.recentGameHeader
                ]}>
                    <Text style={styles.headerText}>
                        {selectedView === 'allGamesOfSelectedDate'
                            ? game.userDisplayName
                            : new Date(Date.parse(game.dateAndTimeUTC)).toLocaleDateString()}
                    </Text>
                    <Text style={styles.headerText}>
                        {new Date(Date.parse(game.dateAndTimeUTC)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                <Menu name={`serverData${game.gameId}`}>
                    <MenuTrigger>
                        <View style={[
                            styles.gameBody,
                            isTopScore && styles.topScoreBody,
                            isMostRecent && styles.recentGameBody
                        ]}>
                            <Text style={styles.rankText}>{index + 1}. </Text>
                            <View style={repeatingElementsStyles.typesCell}>
                                <Text style={styles.scoreText}>{(Math.round(game.score * 10) / 10).toFixed(1)}  </Text>
                                <GameIcon includePopup={false} stat='Medal' />
                            </View>
                            <View style={repeatingElementsStyles.typesCell}>
                                <Text style={styles.turnsText}>{game.turnsPlayed} </Text>
                                <GameIcon includePopup={false} stat='Turns played' />
                            </View>
                            {renderTypes(game.types, [game.playedBonusTypes.bonusType1, game.playedBonusTypes.bonusType2])}
                            <View style={styles.bonusContainer}>
                                <View style={[repeatingElementsStyles.typesCell, styles.bonusTypeCell]}>
                                    <GameIcon includePopup={false} stat={game.playedBonusTypes.bonusType1} />
                                    <StatText stat='basic' text={`${game.playedBonusTypes.playedType1 || 0}`} />
                                </View>
                                <View style={repeatingElementsStyles.typesCell}>
                                    <GameIcon includePopup={false} stat={game.playedBonusTypes.bonusType2} />
                                    <StatText stat='basic' text={`${game.playedBonusTypes.playedType2 || 0}`} />
                                </View>
                                <Text style={styles.bonusText}>  ({game.playedBonusTypes.totalReceivedReward})</Text>
                            </View>
                        </View>
                    </MenuTrigger>
                    <MenuOptions customStyles={menuCustomStyles}>
                        <MenuOption disabled={true}>
                            <View style={styles.menuOptionContainer}>
                                {(['funds', 'workforce', 'quality', 'satisfaction', 'product', 'sales', 'income'] as HighScoreStatsTypes[]).map((stat) => (
                                    <View key={stat} style={repeatingElementsStyles.typesCell}>
                                        <GameIcon includePopup={false} stat={stat} />
                                        <Text style={styles.statText}> {game[stat]}</Text>
                                    </View>
                                ))}
                            </View>
                        </MenuOption>
                    </MenuOptions>
                </Menu>
            </View>
        );
    }, [selectedView, mostRecentGame, renderTypes]);

    return (
        <ScrollView>
            {sortedScores.map(renderGameRow)}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    gameHeader: {
        flexDirection: 'row',
        backgroundColor: '#301619',
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 15,
    },
    topScoreHeader: {
        backgroundColor: '#0b1c0b',
    },
    recentGameHeader: {
        backgroundColor: '#0f1720',
        borderTopWidth: 3,
        borderLeftWidth: 3,
        borderRightWidth: 3,
        borderColor: '#97b7c9',
    },
    headerText: {
        fontSize: 15,
        color: '#f7ecc8',
        fontWeight: '400',
    },
    gameBody: {
        flexDirection: 'row',
        backgroundColor: '#5e2d32',
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingLeft: 15,
        marginBottom: 2,
        paddingVertical: 7
    },
    topScoreBody: {
        backgroundColor: '#1d381d',
    },
    recentGameBody: {
        backgroundColor: '#1d2a38',
        borderBottomWidth: 3,
        borderLeftWidth: 3,
        borderRightWidth: 3,
        borderColor: '#97b7c9',
    },
    rankText: {
        fontSize: 15,
        color: '#f7ecc8',
        fontWeight: '400',
    },
    scoreText: {
        fontSize: 15,
        color: '#f7ecc8',
        fontWeight: '400',
    },
    turnsText: {
        fontSize: 15,
        color: '#f7ecc8',
        fontWeight: '400',
    },
    bonusContainer: {
        flexDirection: 'row',
        backgroundColor: 'rgba(45, 15, 79, 0.6)',
        borderBottomRightRadius: 5,
        width: 150,
        marginVertical: -7,
        paddingVertical: 7,
        borderLeftWidth: 2.5,
        borderColor: '#ffabe7',
        alignItems: 'center',
        marginLeft: -10,
        justifyContent: 'center',
    },
    bonusTypeCell: {
        width: 45,
    },
    bonusText: {
        fontSize: 15,
        color: '#f7ecc8',
        fontWeight: '400',
    },
    menuOptionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
    },
    statText: {
        fontSize: 15,
        color: '#f7ecc8',
        fontWeight: '400',
    },
});

const menuCustomStyles = {
    optionWrapper: { padding: 1 },
    optionsContainer: {
        marginTop: 36,
        width: '90%',
        padding: 10,
        backgroundColor: '#302c2a',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'black',
    },
} as MenuOptionsCustomStyle;

export default React.memo(DisplayedGames);