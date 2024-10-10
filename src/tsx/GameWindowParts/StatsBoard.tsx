import React from 'react';
import { Text, View, Pressable } from 'react-native';
import { useSelector } from 'react-redux';
import { PlayerStats } from '../../store/interfaces/playerStats';
import { Menu, MenuOptions, MenuTrigger, renderers } from 'react-native-popup-menu';
import StatText from '../StylingElements/StatText';
import { useNavigation } from '@react-navigation/native';
import EndTurnButton from './Buttons/EndTurnButton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackNavigatorParamsList } from '../../../App';
import { buttonsStyles } from '../../styleSheets/buttons';
import { menuStyles } from '../../styleSheets/menu';
import { repeatingElementsStyles } from '../../styleSheets/repeatingElements';
import GameIcon from '../Icons/GameIcon';
import { StatsTypes, VarietyTypes } from '../../store/interfaces/gameTypes';

const { Popover } = renderers;

interface StatItemProps {
    icon: VarietyTypes | StatsTypes;
    value: number | string;
    color: string;
    popoverText: string;
    popoverWidth?: number;
    popoverHeight?: number;
    customRender?: (value: number | string) => React.ReactNode;
}

const StatItem: React.FC<StatItemProps> = ({ icon, value, color, popoverText, popoverWidth = 150, popoverHeight = 100, customRender }) => (
    <Menu renderer={Popover} rendererProps={{ preferredPlacement: 'left', height: popoverHeight }}>
        <MenuTrigger>
            <View style={{ flexDirection: "row" }}>
                <GameIcon includePopup={false} stat={icon} />
                {customRender ? customRender(value) : <Text style={{ color }}> {value}</Text>}
            </View>
        </MenuTrigger>
        <MenuOptions customStyles={{ optionWrapper: { padding: 1 }, optionsContainer: [menuStyles.popOverBody, { width: popoverWidth }] }}>
            <Text style={menuStyles.popOverText}>{popoverText}</Text>
        </MenuOptions>
    </Menu>
);

export default function StatsBoard() {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackNavigatorParamsList>>();
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);

    const getIncomePopoverText = () => {
        const projectsCompleted = playerStats.projects.filter(p => p.complete).length;
        const incomeNeeded = 22 - playerStats.income;
        const projectsRemaining = playerStats.projects.every(p => p.complete) ? 0 : 4 - projectsCompleted;
        const productNeeded = Math.max(0, playerStats.projects.every(p => p.complete) ?
            19 - playerStats.income + projectsCompleted - playerStats.product :
            18 - playerStats.income + projectsCompleted - playerStats.product);
        const salesNeeded = Math.max(0, playerStats.projects.every(p => p.complete) ?
            19 - playerStats.income + projectsCompleted - playerStats.sales :
            18 - playerStats.income + projectsCompleted - playerStats.sales);

        return `Income - to win the game you need ${incomeNeeded} more (${projectsRemaining} from projects). You need at least ${productNeeded} more product and ${salesNeeded} more sales.`;
    };

    const getBonusPopoverText = () => {
        const nextTurnBonus = playerStats.workforce + playerStats.satisfaction + playerStats.quality + 4 * playerStats.product + 3 * playerStats.sales;
        return `Bonus - for next turn you will earn ${nextTurnBonus}. 10 of bonus is always automatically traded for 1 of funds whenever available.`;
    };

    const statsConfig: StatItemProps[] = [
        { icon: 'funds', value: playerStats.funds, color: '#ffbaba', popoverText: 'Funds are earned mostly through income, but also through bonus and selling of cards in your hand.', popoverWidth: 200 },
        { icon: 'workforce', value: playerStats.workforce, color: '#8fff82', popoverText: 'Workforce is earned mostly through playing Residential (green) cards, but also through completing demands.', popoverWidth: 220 },
        { icon: 'quality', value: playerStats.quality, color: '#ffa1e1', popoverText: 'Quality is earned through playing Public (blue) cards and through completing demands.', popoverWidth: 200 },
        { icon: 'satisfaction', value: playerStats.satisfaction, color: '#d8adff', popoverText: 'Satisfaction is earned through playing Public (blue) cards and through completing demands.', popoverWidth: 200 },
        { icon: 'product', value: playerStats.product, color: '#fcb3a4', popoverText: 'Product is earned only through playing Industrial (red) cards.', popoverWidth: 150 },
        { icon: 'sales', value: playerStats.sales, color: '#ffe1a1', popoverText: 'Sales is earned only through playing Service (yellow) cards.', popoverWidth: 150 },
        { icon: 'income', value: playerStats.income, color: 'white', popoverText: getIncomePopoverText(), popoverHeight: 140, popoverWidth: 200, customRender: (value) => <StatText stat={'basic'} text={` ${value}`} /> },
        { icon: 'bonus', value: playerStats.bonus, color: 'white', popoverText: getBonusPopoverText(), popoverWidth: 200, customRender: (value) => <StatText stat={'basic'} text={` ${value}`} /> },
        { icon: 'Turns played', value: playerStats.turnsPlayed, color: 'white', popoverText: 'Number of turns played. Try to finish the game with as few turns as possible.', popoverWidth: 200, customRender: (value) => <StatText stat={'basic'} text={` ${value}`} /> },
        {
            icon: playerStats.buildPassesRemaining > 0 ? 'Has Build pass' : 'Build pass',
            value: playerStats.buildPassesRemaining > 1 ? `x${playerStats.buildPassesRemaining}` : ' ',
            color: '#78ff93',
            popoverText: 'Build pass: the icon turns green whenever you gain build pass. Playing more than one card each turn requires build pass.',
            popoverWidth: 230
        },
    ];

    return (
        <View style={{
            backgroundColor: 'rgba(79, 66, 48, 0.5)',
            width: '29%',
            maxWidth: 90,
            paddingVertical: 0,
            paddingHorizontal: 6,
            justifyContent: 'space-between'
        }}>
            <Pressable
                style={({ pressed }) => [buttonsStyles.statButton, { backgroundColor: pressed ? '#7a5a9e' : '#623f8a' }]}
                onPress={() => navigation.navigate('MainMenu')}
            >
                <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 13, color: 'white', fontWeight: "600" }}>MENU</Text>
            </Pressable>
            {statsConfig.reduce((acc, stat, index) => {
                if (index % 2 === 0) acc.push([]);
                acc[acc.length - 1].push(stat);
                return acc;
            }, [] as StatItemProps[][]).map((row, rowIndex) => (
                <View key={rowIndex} style={repeatingElementsStyles.statsCell}>
                    {row.map((stat, statIndex) => (
                        <StatItem key={statIndex} {...stat} />
                    ))}
                </View>
            ))}
            <EndTurnButton />
        </View>
    );
}