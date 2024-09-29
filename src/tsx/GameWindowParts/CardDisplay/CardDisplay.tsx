import React, { useMemo } from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native';
import GameIcon from '../../Icons/GameIcon';
import CardStats from './CardStats';
import { backgrounds, getCardImgByCardId, cardData } from '../../../store/data';
import { Image } from 'expo-image';
import { PlayerStats } from '../../../store/interfaces/playerStats';
import { useSelector } from 'react-redux';
import { CardSectorAndTier } from "../../../store/interfaces/gameTypes";
import { TypeValues } from '../../../store/interfaces/gameTypes';
import { CardTitle } from './CardTitle';
import { CardCombo } from './CardCombo';

export default function CardDisplay() {
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => state.playerStats);

    const currentCard = playerStats.displayedCard;
    const currentCardIndex = currentCard ? currentCard.cardId - 1 : 0;

    const cardsInPlay = useMemo(() => playerStats.gameCards.filter(e => e.location === "Play"), [playerStats.gameCards]);

    const getCardStyles = useMemo(() => {
        if (!currentCard) return { backgroundColor: 'rgba(31, 78, 207, 0.4)' };
        switch (currentCard.sector) {
            case 'Residential': return { backgroundColor: 'rgba(39, 148, 19, 0.4)' };
            case 'Industry': return { backgroundColor: 'rgba(214, 55, 30, 0.4)' };
            case 'Service': return { backgroundColor: 'rgba(227, 194, 57, 0.4)' };
            default: return { backgroundColor: 'rgba(31, 78, 207, 0.4)' };
        }
    }, [currentCard]);

    const calcTierTax = useMemo(() => {
        const currentCardSectorAndTier = `${cardData[currentCardIndex].sector}${cardData[currentCardIndex].tier}` as CardSectorAndTier;
        return playerStats.tierData[currentCardSectorAndTier];
    }, [currentCardIndex, playerStats.tierData]);

    const checkIfCardIsInPlay = (requiredCard: number | null) =>
        requiredCard !== null && cardsInPlay.some(card => card.cardId === requiredCard);

    const checkIfCardIsRequiredByAPlayedCombo = (card: number) =>
        playerStats.playedCombos.some(combo => combo.reqCard === card);

    const listAllPlayedCombosRequiringThisCard = (card: number) =>
        playerStats.playedCombos.filter(combo => combo.reqCard === card);

    const addWorkforceMinus = cardData[currentCardIndex].sector === 'Residential' ? '+' : '-';
    const addPublicMinus = cardData[currentCardIndex].sector === 'Public' ? '+' : '-';

    if (!currentCard) return null;

    return (
        <View style={styles.card}>
            <ImageBackground source={backgrounds[0]} resizeMode="cover" style={styles.backgroundImage} imageStyle={styles.backgroundImageStyle}>
                <View style={[styles.body, getCardStyles]}>
                    <View style={styles.titleAndImage}>
                        <View style={styles.title}>
                            <CardTitle
                                cardId={cardData[currentCardIndex].cardId}
                                cardName={cardData[currentCardIndex].cardName}
                                isRequiredByCombo={checkIfCardIsRequiredByAPlayedCombo(cardData[currentCardIndex].cardId)}
                                combosRequiringCard={listAllPlayedCombosRequiringThisCard(cardData[currentCardIndex].cardId)}
                            />
                        </View>
                        <View style={styles.image}>
                            <Image
                                source={getCardImgByCardId(currentCardIndex + 1)}
                                style={styles.cardImage}
                            />
                        </View>
                        <View style={styles.types}>
                            {cardData[currentCardIndex].types.map((typeObj, index) => (
                                <React.Fragment key={`${typeObj.type}-${index}`}>
                                    {[...Array(typeObj.count)].map((_, i) => (
                                        <View key={`${typeObj.type}-${index}-${i}`} style={{ marginRight: 6 }}>
                                            <GameIcon stat={typeObj.type as TypeValues} />
                                        </View>
                                    ))}
                                </React.Fragment>
                            ))}
                        </View>
                        <View style={styles.effects}>
                            {cardData[currentCardIndex].combos.map(combo =>
                                <CardCombo key={combo.comboId} combo={combo} checkIfCardIsInPlay={checkIfCardIsInPlay} />
                            )}
                        </View>
                    </View>
                    <CardStats
                        card={cardData[currentCardIndex]}
                        calcTierTax={() => calcTierTax}
                        addWorkforceMinus={addWorkforceMinus}
                        addPublicMinus={addPublicMinus}
                    />
                </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        height: undefined,
        aspectRatio: 14 / 20,
        width: '90%',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        borderRadius: 15,
        borderColor: 'black',
        borderWidth: 1
    },
    body: {
        height: '100 %',
        width: '100 %',
        flexDirection: 'row',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,
    },
    titleAndImage: {
        flex: 0.88,
        borderTopLeftRadius: 15,
    },
    title: {
        flex: 0.08,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingStart: 15,
        borderTopLeftRadius: 15,
    },
    image: {
        flex: 0.53,
    },
    types: {
        flex: 0.09,
        flexDirection: 'row',
        width: '100 %',
        backgroundColor: 'rgba(31, 21, 46, 0.9)',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingStart: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: 'white'
    },
    effects: {
        flex: 0.30,
        width: '100 %',
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: 'rgba(31, 21, 46, 0.8)',
        paddingLeft: 5,
        borderBottomLeftRadius: 15,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: 3
    },
    backgroundImage: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    backgroundImageStyle: {
        opacity: 1,
        borderRadius: 15
    },
    cardImage: {
        width: '100%',
        height: '100%',
    }
})
