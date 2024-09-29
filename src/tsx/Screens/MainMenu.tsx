import { Text, View, ImageBackground, StyleSheet } from 'react-native';
import { backgrounds } from '../../store/data';
import { useDispatch, useSelector } from 'react-redux';
import { HighScore } from '../../store/interfaces/highScore';
import { PlayerStats } from '../../store/interfaces/playerStats';
import { restart, updateRestartSlots } from '../../store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackNavigatorParamsList } from '../../../App';
import { gameMenuStyles } from '../../styleSheets/gameMenu';
import { CurrentUser } from '../../store/interfaces/currentUser';
import SignInButton from '../User/SignInButton';
import SignOutButton from '../User/SignOutButton';
import SignUpButton from '../User/SignUpButton';
import MenuButton from './MenuButton';
import GradientText from '../StylingElements/GradientText';
import DataSide from './DataSide';
import GameIcon from '../Icons/GameIcon';
import { CurrentDate } from '../../store/interfaces/currentDate';
import { hideMessage, showMessage } from 'react-native-flash-message';

export default function MainMenu() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackNavigatorParamsList>>();
    const dispatch = useDispatch();

    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);
    const currentDate = useSelector((state: { currentDate: CurrentDate }) => state.currentDate);
    const currentUser = useSelector((state: { currentUser: CurrentUser }) => state.currentUser);
    const playedGames = useSelector((state: { fireStoreDB: { allGamesData: { games: HighScore[] } } }) =>
        state.fireStoreDB.allGamesData.games
    );

    const startNewGame = () => {
        if (currentDate.restartsRemaining > 0) {
            dispatch(updateRestartSlots(-1));
            dispatch(restart());
            navigation.navigate('GameWindow');
        } else {
            showMessage({
                message: "You cannot start a new game until you've refunded a restart slot.",
                type: "danger",
                onPress: () => hideMessage()
            })
        }
    };

    return (
        <View style={styles.container}>
            <DataSide />
            <ImageBackground source={backgrounds[1]} resizeMode="cover" style={styles.backgroundImage} imageStyle={styles.backgroundImageStyle}>
                <View style={gameMenuStyles.menuScreen}>
                    <View style={styles.header}>
                        <View style={styles.authButtons}>
                            {!currentUser.displayName ? (
                                <View style={styles.authButtonsContainer}>
                                    <SignInButton />
                                    <SignUpButton />
                                </View>
                            ) : (
                                <SignOutButton />
                            )}
                        </View>
                        <View style={styles.userInfo}>
                            <View style={styles.userInfoLabel}>
                                <Text style={styles.userInfoLabelText}>Playing as:</Text>
                            </View>
                            <View style={styles.restartInfo}>
                                <Text style={styles.restartInfoText}>
                                    {currentDate.restartsRemaining} of 3 restarts left.
                                </Text>
                                {currentDate.restartsRemaining < 3 ?
                                    <Text style={styles.restartInfoText}>
                                        Next refund in {currentDate.minutesRemainingUntilNextSlot} min.
                                    </Text>
                                    :
                                    <Text style={styles.restartInfoText}>
                                        Slots maxed out.
                                    </Text>
                                }
                            </View>
                            <View style={styles.userInfoName}>
                                <Text style={styles.userInfoNameText}>{!currentUser.displayName ? 'guest' : `${currentUser.displayName}`}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.footer}>
                        <View style={styles.bonusContainer}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={[styles.bonusText, { marginEnd: 5 }]}>Today's bonus: {currentDate.bonusTypes.bonusPoints1}</Text>
                                <GameIcon stat={currentDate.bonusTypes.type1} />
                                <Text style={[styles.bonusText, { marginStart: 5, marginEnd: 5 }]}>and {currentDate.bonusTypes.bonusPoints2}</Text>
                                <GameIcon stat={currentDate.bonusTypes.type2} />
                            </View>
                            <Text style={styles.timeLeftText}>{currentDate.hoursUntilNewDay} hours and {currentDate.minutesUntilNewDay} minutes left</Text>
                        </View>
                    </View>
                    <View style={styles.content}>
                        <GradientText style={styles.title}>MARKET LAW</GradientText>
                        <MenuButton title="New Game" onPress={startNewGame} disabled={false} color="#ee7461" />
                        <MenuButton
                            title="Continue Game"
                            onPress={() => navigation.navigate('GameWindow')}
                            disabled={!playerStats.gameRunning}
                            color={playerStats.gameRunning ? '#ce8a2c' : '#8d7f6c'}
                        />
                        <MenuButton
                            title="High Scores"
                            onPress={() => navigation.navigate('HighScores')}
                            disabled={playedGames.length < 1}
                            color={playedGames && playedGames.length > 0 ? '#9899b4' : '#8d7f6c'}
                        />
                        <MenuButton title="Rules" onPress={() => navigation.navigate('Rules')} disabled={false} color="#8e967a" />
                    </View>
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    backgroundImage: { flex: 1, flexDirection: 'row' },
    backgroundImageStyle: { opacity: 0.6 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: '100%', width: '100%', paddingBottom: 0, paddingLeft: 0 },
    authButtons: { width: '30%', alignItems: 'flex-start' },
    authButtonsContainer: { flexDirection: 'row' },
    userInfo: { flexDirection: 'row', justifyContent: 'flex-end' },
    userInfoLabel: { backgroundColor: '#383147', height: 50, justifyContent: 'center', paddingHorizontal: 15, borderTopLeftRadius: 10 },
    userInfoLabelText: { fontFamily: 'sans-serif-condensed', fontSize: 18, fontWeight: "500", color: '#de9380' },
    userInfoName: { backgroundColor: '#3d5e39', height: 50, justifyContent: 'center', paddingHorizontal: 20 },
    userInfoNameText: { fontFamily: 'sans-serif-condensed', fontSize: 18, fontWeight: "500", color: '#fffebb' },
    content: { height: '85%', width: '100%', position: 'absolute', justifyContent: 'center', alignItems: 'center' },
    title: { fontFamily: 'sans-serif-condensed', fontSize: 65, fontWeight: '700', color: 'white' },
    footer: { position: 'absolute', height: '100%', justifyContent: 'flex-end', alignItems: 'center' },
    bonusContainer: { backgroundColor: '#4a3434', paddingHorizontal: 20, borderTopLeftRadius: 10, borderTopRightRadius: 10, justifyContent: 'flex-end', flexDirection: 'column' },
    bonusText: { fontFamily: 'sans-serif-condensed', fontSize: 18, fontWeight: "500", color: '#fffebb' },
    timeLeftText: { fontFamily: 'sans-serif-condensed', fontSize: 18, fontWeight: "500", color: '#ffa99f' },
    restartInfo: { position: 'absolute', justifyContent: 'flex-start', width: '90%', marginTop: -60, flexDirection: 'column', alignItems: 'flex-start', },
    restartInfoText: { fontFamily: 'sans-serif-condensed', fontSize: 18, fontWeight: "700", color: '#ffd7bb', marginBottom: 5, },
});