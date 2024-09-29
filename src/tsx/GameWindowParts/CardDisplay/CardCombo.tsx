import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Menu, MenuOptions, MenuTrigger, renderers } from 'react-native-popup-menu';
import GameIcon from '../../Icons/GameIcon';
import { Combo } from '../../../store/interfaces/combo';
import { TypeValues } from '../../../store/interfaces/gameTypes';
import { types, cardData } from '../../../store/data';
const { Popover } = renderers;

interface CardComboProps {
    combo: Combo;
    checkIfCardIsInPlay: (requiredCard: number | null) => boolean;
}

const CardCombo: React.FC<CardComboProps> = ({ combo, checkIfCardIsInPlay }) => (
    <View style={[styles.combo, {
        borderColor: '#6f7fbd',
        backgroundColor: combo.infinite ? 'rgba(56, 69, 120,0.5)' : 'rgba(56, 69, 120,0)',
        borderWidth: combo.infinite ? 2 : 0,
        borderRadius: combo.infinite ? 5 : 0,
        paddingTop: cardData.some(e => e.cardName === combo.reqType) ? 7 : 0,
    }]}>
        {combo.reqN > 1 && <Text style={{ color: '#f7ecc8' }}>{combo.reqN}</Text>}
        {combo.reqType && types.includes(combo.reqType as TypeValues) ?
            <GameIcon stat={combo.reqType as TypeValues} /> :
            combo.reqCard && cardData.some(e => e.cardId === combo.reqCard) &&
            <Menu renderer={Popover} rendererProps={{ preferredPlacement: 'bottom' }}>
                <MenuTrigger>
                    <Text style={{
                        color: checkIfCardIsInPlay(combo.reqCard) ? '#fc490d' : '#f7ecc8',
                        fontWeight: checkIfCardIsInPlay(combo.reqCard) ? '900' : '400',
                        textDecorationLine: checkIfCardIsInPlay(combo.reqCard) ? 'underline' : 'none',
                    }}>#{cardData.find(e => e.cardId === combo.reqCard)?.cardId}
                    </Text>
                </MenuTrigger>
                <MenuOptions
                    customStyles={{ optionWrapper: { padding: 1 }, optionsContainer: styles.popOverBody }}>
                    <Text style={styles.popOverText}>{combo.reqCard !== null ? cardData[combo.reqCard - 1].cardName : ''}</Text>
                </MenuOptions>
            </Menu>
        }
        <Text style={{ fontSize: 17, color: '#f7ecc8' }}> = </Text>
        {combo.gainsN > 1 && <Text style={{ color: '#f7ecc8' }}>{combo.gainsN}</Text>}
        <GameIcon includePopup={false} stat={combo.gainsType} />
    </View>
);

const styles = StyleSheet.create({
    popOverText: {
        fontFamily: 'sans-serif-condensed',
        color: '#4a3632',
        fontWeight: '400',
        fontSize: 13
    },
    popOverBody: {
        width: 120,
        padding: 10,
        backgroundColor: '#f0d5a8',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'black',
        justifyContent: 'center',
        alignItems: 'center'
    },
    combo: {
        maxWidth: '50%',
        minWidth: '35%',
        height: 35,
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'nowrap',
        padding: 0,
        marginHorizontal: 3,
        marginVertical: 3,
        alignItems: 'center'
    }
});

export { CardCombo };