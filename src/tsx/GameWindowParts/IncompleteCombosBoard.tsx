import React from 'react';
import { Text, View, ScrollView, Pressable } from 'react-native';
import { Menu, MenuOptions, MenuTrigger, renderers } from 'react-native-popup-menu';
import { claimCombo } from '../../store';
import { cardData } from '../../store/data';
import { types } from '../../store/data';
import { PlayerStats } from '../../store/interfaces/playerStats';
import { useSelector } from 'react-redux';
import GameIcon from '../Icons/GameIcon';
import { menuStyles } from '../../styleSheets/menu';
import { buttonsStyles } from '../../styleSheets/buttons';
import { TypeValues } from '../../store/interfaces/gameTypes';
import { Combo } from '../../store/interfaces/combo';

const { Popover } = renderers;

export default function IncompleteCombosBoard() {
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);

    const sortCombos = (a: Combo, b: Combo) => {
        if (a.reqCard === null && b.reqCard !== null) return -1;
        if (a.reqCard !== null && b.reqCard === null) return 1;

        if (a.reqCard !== null && b.reqCard !== null) {
            return a.reqCard - b.reqCard;
        }

        if (a.infinite && !b.infinite) return -1;

        if (!a.infinite && b.infinite) return 1;

        if (a.reqN !== b.reqN) return a.reqN - b.reqN;

        if (a.infiniteReqTypeCount !== b.infiniteReqTypeCount)
            return b.infiniteReqTypeCount - a.infiniteReqTypeCount;

        if (a.regularReqTypeCount !== b.regularReqTypeCount)
            return b.regularReqTypeCount - a.regularReqTypeCount;

        if (a.reqType && b.reqType) return a.reqType.localeCompare(b.reqType);

        return 0;
    };

    const renderComboItem = (combo: Combo) => (
        <Pressable
            key={combo.comboId}
            onPress={() => claimCombo(combo)}
            style={[
                {
                    height: 40,
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderRadius: 5,
                    paddingVertical: 1,
                    paddingHorizontal: 1,
                    marginVertical: 2,
                    borderColor: combo.infinite && combo.complete ? '#6987ff' : combo.infinite && !combo.complete ? '#a1b1c2' : combo.complete ? '#57a63f' : '#593126',
                    backgroundColor: combo.infinite && combo.complete ? '#3b4d96' : combo.infinite && !combo.complete ? '#46607a' : combo.complete ? 'rgba(48, 92, 41, 0.5)' : 'rgba(84, 61, 56, 0.5)'
                }
            ]}
        >
            {combo.reqN > 1 && <Text style={{ color: '#f7ecc8' }}>{combo.reqN}</Text>}
            {combo.reqType && types.includes(combo.reqType as TypeValues) ? (
                <GameIcon includePopup={false} stat={combo.reqType as TypeValues} />
            ) : combo.reqCard !== null ? (
                <Text style={{ color: '#f7ecc8', fontSize: 12 }}>
                    #{cardData.find(e => e.cardId === combo.reqCard)?.cardId}
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
                        <Text adjustsFontSizeToFit={true} numberOfLines={1} style={{ fontSize: 13, color: 'white', fontWeight: "600" }}>
                            DEMANDS
                        </Text>
                    </View>
                </MenuTrigger>
                <MenuOptions customStyles={{ optionWrapper: { padding: 1 }, optionsContainer: [menuStyles.popOverBody, { width: 200 }] }}>
                    <Text style={menuStyles.popOverText}>
                        Display of all the demands among cards you have played. All demands require you to have in play either a specific type or a specific card.
                        Demands with a blue background are continuous meaning you can claim their reward again whenever you complete its requirement.
                    </Text>
                </MenuOptions>
            </Menu>
            <ScrollView>
                {playerStats.playedCombos && playerStats.playedCombos.length > 0 &&
                    playerStats.playedCombos
                        .slice()
                        .sort(sortCombos)
                        .map((combo) => combo.reqN > 0 && !combo.complete && renderComboItem(combo))
                }
            </ScrollView>
        </View>
    );
}