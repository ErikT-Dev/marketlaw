import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Menu, MenuOptions, MenuTrigger, renderers } from 'react-native-popup-menu';
import GameIcon from '../../Icons/GameIcon';
import { Combo } from '../../../store/interfaces/combo';
const { Popover } = renderers;

interface CardTitleProps {
    cardId: number;
    cardName: string;
    isRequiredByCombo: boolean;
    combosRequiringCard: Combo[];
}

const CardTitle: React.FC<CardTitleProps> = ({ cardId, cardName, isRequiredByCombo, combosRequiringCard }) => {
    const titleText = (
        <Text
            adjustsFontSizeToFit={true}
            numberOfLines={1}
            style={{
                fontFamily: 'sans-serif-condensed',
                color: isRequiredByCombo ? '#cf2204' : '#29231e',
                textDecorationLine: isRequiredByCombo ? 'underline' : 'none'
            }}
        >
            #{cardId} {cardName}
        </Text>
    );

    if (!isRequiredByCombo) {
        return titleText;
    }

    return (
        <Menu renderer={Popover} rendererProps={{ preferredPlacement: 'bottom' }}>
            <MenuTrigger>
                {titleText}
            </MenuTrigger>
            <MenuOptions
                customStyles={{ optionWrapper: { padding: 1 }, optionsContainer: [styles.popOverBody, { width: 120 }] }}>
                <Text style={styles.popOverText}>Demands for this card will give you:</Text>
                {combosRequiringCard.map((i) => (
                    <View key={i.comboId} style={{ flexDirection: 'row', paddingVertical: 2 }}>
                        <Text style={styles.popOverText}>{i.gainsN} </Text>
                        <GameIcon includePopup={false} stat={i.gainsType} />
                    </View>
                ))}
            </MenuOptions>
        </Menu>
    );
};

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
    }
});

export { CardTitle };