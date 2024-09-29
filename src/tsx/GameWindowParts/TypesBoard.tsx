import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Menu, MenuOptions, MenuTrigger, renderers } from 'react-native-popup-menu';
import { useSelector } from 'react-redux';
import { PlayerStats } from '../../store/interfaces/playerStats';
import StatText from '../StylingElements/StatText';
import GameIcon from '../Icons/GameIcon';
import { menuStyles } from '../../styleSheets/menu';
import { buttonsStyles } from '../../styleSheets/buttons';
import { TypeValues } from '../../store/interfaces/gameTypes';

const { Popover } = renderers;

const TypesBoard: React.FC = () => {
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);

    const sortedTypes = useMemo(() => {
        return [...playerStats.types].sort((a, b) => b.count - a.count);
    }, [playerStats.types]);

    const renderTypeItem = (item: { type: TypeValues; count: number }, index: number) => (
        <View key={index} style={{ flexDirection: 'row', width: '33.33%', paddingVertical: 3 }}>
            <GameIcon stat={item.type} />
            <StatText stat='basic' text={`${item.count}`} />
        </View>
    );

    return (
        <View style={{
            backgroundColor: 'rgba(79, 66, 48, 0.5)',
            width: '41%',
            paddingLeft: 3
        }}>
            <ScrollView>
                <View style={{
                    maxWidth: 125,
                    minWidth: 110,
                    alignItems: 'center',
                }}>
                    <Menu renderer={Popover} rendererProps={{ preferredPlacement: 'bottom' }}>
                        <MenuTrigger>
                            <View style={[buttonsStyles.statButton, { width: '100%', flexDirection: 'row', justifyContent: 'space-around' }]}>
                                <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 14, color: 'white', fontWeight: '600' }}>
                                    {playerStats.playedBonusTypes.baseRewardOfType1}
                                </Text>
                                <GameIcon includePopup={false} stat={playerStats.playedBonusTypes.bonusType1} />
                                <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                                    {playerStats.playedBonusTypes.baseRewardOfType2}
                                </Text>
                                <GameIcon includePopup={false} stat={playerStats.playedBonusTypes.bonusType2} />
                                <Text style={{ fontSize: 14, fontWeight: '600', color: 'white' }}>
                                    ({playerStats.playedBonusTypes.totalReceivedReward})
                                </Text>
                            </View>
                        </MenuTrigger>
                        <MenuOptions customStyles={{ optionWrapper: { padding: 1 }, optionsContainer: menuStyles.popOverBody }}>
                            <Text style={menuStyles.popOverText}>
                                Display of all the types among cards you have played sorted from most to least occurring. Currently you will receive {playerStats.playedBonusTypes.totalReceivedReward} bonus points.
                            </Text>
                        </MenuOptions>
                    </Menu>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', width: '100%' }}>
                        {sortedTypes.map(renderTypeItem)}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default React.memo(TypesBoard);