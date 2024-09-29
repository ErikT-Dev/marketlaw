import React from 'react';
import { Text, View, ScrollView, Pressable } from 'react-native';
import { Menu, MenuOptions, MenuTrigger, renderers } from 'react-native-popup-menu';
import { claimCombo } from '../../store';
import { cardData } from '../../store/data';
import { types } from '../../store/data';
import { PlayerStats } from '../../store/interfaces/playerStats';
import { useSelector, useDispatch } from 'react-redux';
import { menuStyles } from '../../styleSheets/menu';
import { buttonsStyles } from '../../styleSheets/buttons';
import GameIcon from '../Icons/GameIcon';
import { TypeValues } from '../../store/interfaces/gameTypes';
import { Combo } from '../../store/interfaces/combo';

const { Popover } = renderers;

export default function CompleteCombosBoard() {
    const dispatch = useDispatch();
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);

    const sortCombos = (a: Combo, b: Combo) => {
        if (a.reqCard === null && b.reqCard !== null) return 1;
        if (a.reqCard !== null && b.reqCard === null) return -1;

        if (a.reqCard !== null && b.reqCard !== null) {
            return a.reqCard - b.reqCard;
        }

        if (a.infinite && !b.infinite) return -1;

        if (!a.infinite && b.infinite) return 1;

        if (a.reqN !== b.reqN) return a.reqN - b.reqN;

        if (a.reqType && b.reqType) return a.reqType.localeCompare(b.reqType);

        return 0;
    };

    const renderComboItem = (combo: Combo) => (
        <Pressable
            key={combo.comboId}
            onPress={() => dispatch(claimCombo(combo))}
            style={({ pressed }) => [
                {
                    height: 40,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderRadius: 5,
                    paddingVertical: 1,
                    paddingHorizontal: 1,
                    marginVertical: 2,
                    borderColor: combo.infinite ? '#6987ff' : '#57a63f',
                    backgroundColor: combo.infinite && pressed ? '#4965de' :
                        combo.infinite ? '#3b4d96' :
                            pressed ? 'rgba(115, 196, 102, 0.5)' :
                                'rgba(48, 92, 41, 0.5)'
                }
            ]}
        >
            {combo.reqN > 1 && <Text style={{ color: '#f7ecc8' }}>{combo.reqN}</Text>}
            {combo.reqType ? (
                <GameIcon includePopup={false} stat={combo.reqType as TypeValues} />
            ) : combo.reqCard !== null ? (
                <Text style={{ color: '#f7ecc8', fontSize: 12 }}>
                    #{combo.reqCard}
                </Text>
            ) : null}
            <Text style={{ fontSize: 14, color: '#f7ecc8' }}> = </Text>
            {combo.gainsN > 1 && <Text style={{ color: '#f7ecc8' }}>{combo.gainsN}</Text>}
            <GameIcon includePopup={false} stat={combo.gainsType} />
        </Pressable>
    );

    return (
        <View style={{
            width: '35%',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            paddingVertical: 0,
            paddingHorizontal: 0,
            alignItems: 'center',
        }}>
            <Menu renderer={Popover} rendererProps={{ preferredPlacement: 'bottom' }}>
                <MenuTrigger>
                    <View style={buttonsStyles.statButton}>
                        <Text adjustsFontSizeToFit={true}
                            numberOfLines={1} style={{ fontSize: 13, color: 'white', fontWeight: "600" }}>REWARDS</Text>
                    </View>
                </MenuTrigger>
                <MenuOptions
                    customStyles={{ optionWrapper: { padding: 1 }, optionsContainer: menuStyles.popOverBody }}>
                    <Text style={menuStyles.popOverText}>
                        Display of all the demands of which you are ready to claim its reward.
                    </Text>
                </MenuOptions>
            </Menu>
            <ScrollView>
                {playerStats.playedCombos && playerStats.playedCombos.length > 0 &&
                    playerStats.playedCombos
                        .slice()
                        .sort(sortCombos)
                        .map((combo) => combo.reqN > 0 && combo.complete && renderComboItem(combo))
                }
            </ScrollView>
        </View>
    );
}