import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ImageBackground, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { backgrounds, currentSeason } from '../../store/data';
import { RootStackNavigatorParamsList } from '../../../App';
import { gameMenuStyles } from '../../styleSheets/gameMenu';
import { Player } from '../../store/interfaces/player';
import { HighScore } from '../../store/interfaces/highScore';
import { UniqueDate } from '../../store/interfaces/uniqueDate';
import { CurrentUser } from '../../store/interfaces/currentUser';
import { convertUTCtoDate } from '../../store/functions/convertUTCtoDate';
import { parseLocaleDateString } from '../../store/functions/parseLocaleDateString';
import PlayerRankings from '../HighScoresParts/PlayerRankings';
import DisplayedGames from '../HighScoresParts/DisplayedGames';
import DateSelector from '../HighScoresParts/DateSelector';

type ViewType = 'allGamesOfSelectedDate' | 'playerRankings' | 'allGamesOfSelectedPlayer';

export default function HighScores() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackNavigatorParamsList>>();
    const [selectedSeason, setSelectedSeason] = useState<number>(currentSeason);
    const [selectedView, setSelectedView] = useState<ViewType>('allGamesOfSelectedDate');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    const currentUser = useSelector((state: { currentUser: CurrentUser }) => state.currentUser);
    const players = useSelector((state: any) => state.fireStoreDB.players as Player[]);
    const playedGames = useSelector((state: any) => state.fireStoreDB.allGamesData.games as HighScore[]);
    const playedDates = useSelector((state: any) => state.fireStoreDB.allGamesData.dates as UniqueDate[]);

    const loggedInPlayer = useMemo(() => players.find(player => player.uid === currentUser.uid), [players, currentUser]);

    const sortedDates = useMemo(() =>
        [...playedDates].sort((a, b) => parseLocaleDateString(b.dateString) - parseLocaleDateString(a.dateString)),
        [playedDates]);

    const [selectedDate, setSelectedDate] = useState<string>(sortedDates[0]?.dateString || '');

    const displayedScores = useMemo(() => {
        if (selectedPlayer && selectedView === 'allGamesOfSelectedPlayer') {
            return playedGames.filter((game) => game.userUid === selectedPlayer.uid);
        }
        return playedGames.filter((score) => convertUTCtoDate(score.dateAndTimeUTC) === selectedDate);
    }, [selectedPlayer, selectedView, playedGames, selectedDate]);

    const handlePlayerSelect = useCallback((player: Player) => {
        setSelectedView('allGamesOfSelectedPlayer');
        setSelectedPlayer(player);
    }, []);

    const renderViewButton = useCallback((viewType: ViewType, label: string, backgroundColor: string, pressedColor: string, onPress: () => void) => (
        <Pressable
            style={({ pressed }) => [
                styles.viewButton,
                { backgroundColor: pressed ? pressedColor : backgroundColor }
            ]}
            onPress={onPress}
        >
            <Text style={[styles.buttonText, selectedView === viewType && styles.underlinedText]}>
                {label}
            </Text>
        </Pressable>
    ), [selectedView]);

    return (
        <View style={gameMenuStyles.menuBackground}>
            <ImageBackground source={backgrounds[1]} resizeMode="cover" style={styles.backgroundImage} imageStyle={{ opacity: 0.6 }}>
                <View style={styles.content}>
                    <View style={styles.scoresContainer}>
                        {selectedView !== 'playerRankings'
                            ? <DisplayedGames displayedScores={displayedScores} selectedView={selectedView} />
                            : <PlayerRankings selectedSeason={selectedSeason} onPlayerSelect={handlePlayerSelect} />
                        }
                    </View>
                    <View style={styles.footer}>
                        <View style={styles.buttonContainer}>
                            {selectedView === 'allGamesOfSelectedDate' ? (
                                <DateSelector onSelect={setSelectedDate} selectedDate={selectedDate} />
                            ) : (
                                <View style={styles.playerNameContainer}>
                                    <Text style={styles.playerNameText}>
                                        {selectedPlayer ? selectedPlayer.displayName : 'All Players'}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.seasonContainer}>
                                <Text style={styles.seasonText}>Season {selectedSeason}</Text>
                            </View>
                            {renderViewButton(
                                'allGamesOfSelectedDate',
                                'Games Statistics',
                                '#64322f',
                                '#814441',
                                () => setSelectedView('allGamesOfSelectedDate')
                            )}
                            {renderViewButton(
                                'playerRankings',
                                'Leaderboards',
                                '#bd700c',
                                '#d88d2a',
                                () => {
                                    setSelectedPlayer(null);
                                    setSelectedView('playerRankings');
                                }
                            )}
                            {loggedInPlayer && renderViewButton(
                                'allGamesOfSelectedPlayer',
                                'My Games',
                                '#b04e21',
                                '#d0693a',
                                () => {
                                    setSelectedPlayer(loggedInPlayer);
                                    setSelectedView('allGamesOfSelectedPlayer');
                                }
                            )}
                            <Pressable
                                style={({ pressed }) => [
                                    styles.viewButton,
                                    { backgroundColor: pressed ? '#8a5e50' : '#62443b' }
                                ]}
                                onPress={() => navigation.navigate('MainMenu')}
                            >
                                <Text style={styles.buttonText}>Back To Menu</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        flexDirection: 'row',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(245, 84, 59, 0.5)',
        flexDirection: 'column',
    },
    scoresContainer: {
        flex: 0.84,
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: '5%',
        paddingTop: 30,
    },
    footer: {
        flex: 0.16,
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(39, 21, 18, 0.45)',
        height: '100%',
    },
    playerNameContainer: {
        backgroundColor: '#691403',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        height: '100%',
        width: 120,
    },
    playerNameText: {
        color: 'white',
    },
    seasonContainer: {
        backgroundColor: '#a2113c',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 12,
        height: '100%',
        flexGrow: 1,
        borderLeftWidth: 2.5,
        borderColor: 'white',
    },
    seasonText: {
        color: 'white',
    },
    viewButton: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: '100%',
        flexGrow: 1,
        borderLeftWidth: 2.5,
        borderColor: 'white',
    },
    buttonText: {
        color: 'white',
    },
    underlinedText: {
        textDecorationLine: 'underline',
    },
});