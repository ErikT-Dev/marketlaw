import React, { useMemo } from 'react';
import { Text, View, ScrollView } from 'react-native';
import { Menu, MenuOptions, MenuTrigger, renderers } from 'react-native-popup-menu';
import { useSelector } from 'react-redux';
import PlayedCard from './Buttons/PlayedCardButton';
import { PlayerStats } from '../../store/interfaces/playerStats';
import { menuStyles } from '../../styleSheets/menu';
import { buttonsStyles } from '../../styleSheets/buttons';
import StatText from '../StylingElements/StatText';
import GameIcon from '../Icons/GameIcon';

const { Popover } = renderers;

const PlayedCards: React.FC = () => {
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);

    const cardsInPlay = useMemo(() =>
        playerStats.gameCards.filter(e => e.location === "Play"),
        [playerStats.gameCards]);

    return (
        <View style={{ width: '30%' }}>
            <Menu renderer={Popover} rendererProps={{ preferredPlacement: 'bottom' }}>
                <MenuTrigger>
                    <View style={buttonsStyles.statButton}>
                        {cardsInPlay.length === 0 ? (
                            <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontSize: 13, color: 'white', fontWeight: "600" }}>
                                BOARD
                            </Text>
                        ) : (
                            <View style={{ flexDirection: "row" }}>
                                <GameIcon includePopup={false} stat={'Cards played'} />
                                <StatText stat={'basic'} text={` ${cardsInPlay.length}`} />
                            </View>
                        )}
                    </View>
                </MenuTrigger>
                <MenuOptions customStyles={{ optionWrapper: { padding: 1 }, optionsContainer: menuStyles.popOverBody }}>
                    <Text style={menuStyles.popOverText}>
                        Board of all the cards you have played showing the card's tier (roman numeral) and sector (color).
                        Keep in mind that all cards will cost 1 more for each card already in play of the same tier and sector.
                    </Text>
                </MenuOptions>
            </Menu>
            <ScrollView contentContainerStyle={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                flexWrap: "wrap",
            }}>
                {cardsInPlay.map((card) => (
                    <PlayedCard key={card.cardId} card={card} />
                ))}
            </ScrollView>
        </View>
    );
};

export default React.memo(PlayedCards);