import React, { useMemo, useCallback } from 'react';
import { Text, View, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { HighScore } from '../../store/interfaces/highScore';
import { Player } from '../../store/interfaces/player';
import { findDataForThatUser } from '../../store/functions/findDataForThatUser';
import StatText from '../StylingElements/StatText';
import { repeatingElementsStyles } from '../../styleSheets/repeatingElements';
import { Type } from "../../store/interfaces/gameTypes";
import { sumUpTwoArraysByTypeCount } from '../../store/functions/sumUpTwoTypeArrays';
import GameIcon from '../Icons/GameIcon';

interface PlayerRankingsProps {
    onPlayerSelect: (player: Player) => void;
    selectedSeason: number;
}

const PlayerRankings: React.FC<PlayerRankingsProps> = ({ onPlayerSelect, selectedSeason }) => {
    const players = useSelector((state: { fireStoreDB: { players: Player[] } }) => state.fireStoreDB.players);
    const playedGames = useSelector((state: { fireStoreDB: { allGamesData: { games: HighScore[] } } }) => state.fireStoreDB.allGamesData.games);

    const mostPlayedTypesOfThatPlayer = useCallback((player: Player) => {
        const gamesOfThatPlayer = playedGames.filter(game => game.userUid === player.uid);
        const summedTypesOfAllGames = gamesOfThatPlayer.flatMap(game => game.types);
        return sumUpTwoArraysByTypeCount(...summedTypesOfAllGames) as Type[];
    }, [playedGames]);

    const sumCountOfAllTypes = useCallback((allTypes: Type[]) =>
        allTypes.reduce((sum, type) => sum + type.count, 0),
        []);

    const getRankPoints = useCallback((player: Player) => {
        const rankPoints = findDataForThatUser(player, 'rankPoints', playedGames, selectedSeason);
        return typeof rankPoints === 'number' ? rankPoints : 0;
    }, [playedGames, selectedSeason]);

    const sortedPlayers = useMemo(() =>
        [...players].sort((a, b) => getRankPoints(b) - getRankPoints(a)),
        [players, getRankPoints]);

    const renderPlayerRow = useCallback((player: Player, index: number) => {
        const mostPlayedTypes = mostPlayedTypesOfThatPlayer(player);
        const totalTypeCount = sumCountOfAllTypes(mostPlayedTypes);

        return (
            <View key={player.uid} style={[styles.playerRow, index === 0 && styles.topPlayerRow]}>
                <View style={styles.rankColumn}>
                    <Text style={styles.rankText}>{index + 1}.</Text>
                    <Text style={styles.pointsText}>{getRankPoints(player)}</Text>
                </View>
                <Text style={styles.nameText} numberOfLines={1}>{player.displayName}</Text>
                <View style={styles.statsColumn}>
                    <Text style={styles.gamesText}>{findDataForThatUser(player, 'gamesCount', playedGames, selectedSeason)}</Text>
                    <Text style={styles.scoreText}>{findDataForThatUser(player, 'highestScore', playedGames, selectedSeason)}</Text>
                </View>
                {mostPlayedTypes.slice(0, 5).map((type, typeIndex) => (
                    <View key={typeIndex} style={repeatingElementsStyles.typesCell}>
                        <GameIcon includePopup={false} stat={type.type} />
                        <StatText stat='basic' text={`${Math.round(type.count / totalTypeCount * 1000) / 10}`} />
                    </View>
                ))}
                <Pressable onPress={() => onPlayerSelect(player)} style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View</Text>
                </Pressable>
            </View>
        );
    }, [mostPlayedTypesOfThatPlayer, sumCountOfAllTypes, playedGames, selectedSeason, onPlayerSelect, getRankPoints]);

    return (
        <>
            <View style={styles.header}>
                <View style={{ flex: 0.6 }}>
                    <Text style={{
                        fontSize: 15,
                        color: '#ac9c7d',
                        fontWeight: '400',
                    }}>Rank</Text>
                    <Text style={{
                        fontSize: 15,
                        color: '#87e5ff',
                        fontWeight: '400',
                    }}>Points</Text>
                </View>
                <View style={{ flex: 0.75 }}>
                    <Text style={{
                        fontSize: 15,
                        color: '#f7ecc8',
                        fontWeight: '400',
                    }}>Player Name</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{
                        fontSize: 15,
                        color: '#ac9c7d',
                        fontWeight: '400',
                    }}>Games</Text>
                    <Text style={{
                        fontSize: 15,
                        color: '#53ff86',
                        fontWeight: '400',
                    }}>Best</Text>
                </View>
                <View style={{ flex: 3, alignItems: 'center' }}>
                    <Text style={{
                        fontSize: 15,
                        color: '#f7ecc8',
                        fontWeight: '400',
                    }}>Most Played Types (% of all)</Text>
                </View>
            </View>
            <ScrollView>
                {sortedPlayers.map(renderPlayerRow)}
            </ScrollView>
        </>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        borderColor: '#c4aa92',
        borderBottomWidth: 4,
        backgroundColor: '#222122',
        borderTopRightRadius: 5,
        borderTopLeftRadius: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 15,
        height: 50,
        marginTop: -20,
    },
    headerColumn: {
        flex: 1,
    },
    headerText: {
        fontSize: 15,
        color: '#ac9c7d',
        fontWeight: '400',
    },
    playerRow: {
        flexDirection: 'row',
        borderColor: '#6bccff',
        backgroundColor: '#5e2d32',
        borderBottomRightRadius: 5,
        borderBottomLeftRadius: 5,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingLeft: 10,
        marginBottom: 4,
        height: 45,
    },
    topPlayerRow: {
        backgroundColor: '#1d381d',
    },
    rankColumn: {
        width: '7%',
        alignItems: 'center',
    },
    rankText: {
        fontSize: 15,
        color: '#ac9c7d',
        fontWeight: '400',
    },
    pointsText: {
        fontSize: 15,
        color: '#87e5ff',
        fontWeight: '400',
    },
    nameText: {
        fontSize: 15,
        color: '#f7ecc8',
        fontWeight: '400',
        width: '15%',
    },
    statsColumn: {
        width: '7%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gamesText: {
        fontSize: 15,
        color: '#ac9c7d',
        fontWeight: '400',
    },
    scoreText: {
        fontSize: 15,
        color: '#53ff86',
        fontWeight: '400',
    },
    viewButton: {
        backgroundColor: '#4d1912',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 7,
        height: '100%',
        borderBottomRightRadius: 5,
    },
    viewButtonText: {
        color: 'white',
    },
    centerAlign: {
        alignItems: 'center',
    },
});

export default React.memo(PlayerRankings);