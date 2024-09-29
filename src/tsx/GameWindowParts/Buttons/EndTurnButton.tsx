import React, { useCallback, useMemo } from 'react';
import { Text, View, ViewStyle, TextStyle } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { endTurn, endGame, saveNewScore, updateRestartSlots } from '../../../store';
import { PlayerStats } from '../../../store/interfaces/playerStats';
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu';
import { useNavigation } from '@react-navigation/native';
import { CurrentUser } from '../../../store/interfaces/currentUser';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackNavigatorParamsList } from '../../../../App';
import { menuStyles } from '../../../styleSheets/menu';

const sectors = [
    { name: 'Residential', color: 'rgba(61, 110, 52, 1)' },
    { name: 'Industry', color: 'rgba(158, 72, 57, 1)' },
    { name: 'Service', color: 'rgba(184, 136, 6, 1)' },
    { name: 'Public', color: 'rgba(78, 90, 173,1)' },
] as const;

interface MenuButtonProps {
    children: React.ReactNode;
    color: string;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const MenuButton: React.FC<MenuButtonProps> = ({ children, color, style, textStyle }) => (
    <View style={[menuStyles.actionButton, { backgroundColor: color }, style]}>
        <Text style={[{ fontSize: 12, color: 'white', fontWeight: "500" }, textStyle]}>{children}</Text>
    </View>
);

interface MenuOptionButtonProps {
    onSelect: () => void;
    color: string;
    children: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

const MenuOptionButton: React.FC<MenuOptionButtonProps> = ({ onSelect, color, children, style, textStyle }) => (
    <MenuOption onSelect={onSelect}>
        <View style={[menuStyles.actionOption, { backgroundColor: color }, style]}>
            <Text style={[{ fontSize: 14, color: 'black', fontWeight: "500" }, textStyle]}>{children}</Text>
        </View>
    </MenuOption>
);

export default function EndTurnButton() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackNavigatorParamsList>>();
    const dispatch = useDispatch();
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);
    const currentUser = useSelector((state: { currentUser: CurrentUser }) => state.currentUser as CurrentUser);

    const isGameWon = playerStats.income > 21 && playerStats.projects.every(p => p.complete);

    const completeAGame = useCallback(() => {
        dispatch(endGame());
        dispatch(saveNewScore({ playerStats, currentUser }));
        dispatch(updateRestartSlots(3))
        navigation.navigate('MainMenu');
    }, [dispatch, playerStats, currentUser, navigation]);

    const endTurnCleanly = useCallback((sector: typeof sectors[number]['name']) => {
        dispatch(endTurn(sector));
    }, [dispatch]);

    const menuOptions = useMemo(() => ({
        optionWrapper: { padding: 1 },
        optionsContainer: {
            width: 120,
            padding: 10,
            backgroundColor: '#392a4a',
            borderRadius: 5,
            borderWidth: 1,
            borderColor: 'black'
        }
    }), []);

    return (
        <Menu>
            <MenuTrigger>
                <MenuButton color={isGameWon ? '#e35919' : (playerStats.playedCardThisTurn || playerStats.skippedBuildThisTurn ? '#e39912' : '#5c4e36')}>
                    {isGameWon ? 'GAME WON' : 'END TURN'}
                </MenuButton>
            </MenuTrigger>
            <MenuOptions customStyles={menuOptions}>
                {isGameWon ? (
                    <>
                        <MenuOption disabled>
                            <Text style={{ fontSize: 14, color: 'white', fontWeight: "400" }}>Buy build pass or end the game.</Text>
                            {!currentUser.uid && (
                                <Text style={{ fontSize: 14, color: '#ffa69e', fontWeight: "400" }}>
                                    Warning! You are currently not logged in and the game will not be added to your statistics!
                                </Text>
                            )}
                        </MenuOption>
                        <MenuOptionButton onSelect={completeAGame} color="#edcc53">End game</MenuOptionButton>
                    </>
                ) : (
                    <>
                        {playerStats.income > 21 && (
                            <MenuOption disabled>
                                <Text style={{ fontSize: 14, color: '#ffa69e', fontWeight: "400" }}>
                                    • In order to win the game you must complete 3 projects!
                                </Text>
                            </MenuOption>
                        )}
                        <MenuOption disabled>
                            <Text style={{ fontSize: 14, color: 'white', fontWeight: "400" }}>Choose which sector to draw from:</Text>
                        </MenuOption>
                        {sectors.map(sector => (
                            <MenuOptionButton
                                key={sector.name}
                                onSelect={() => endTurnCleanly(sector.name)}
                                color={sector.color}
                            >
                                • {sector.name}
                            </MenuOptionButton>
                        ))}
                    </>
                )}
            </MenuOptions>
        </Menu>
    );
}