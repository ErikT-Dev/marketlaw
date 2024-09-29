import { StyleSheet, Text, Pressable } from 'react-native';
import { GameCard } from '../../store/interfaces/cardInAction';
import { cardData } from '../../store/data';
import { useDispatch, useSelector } from 'react-redux';
import { setDisplayToCard, playCard } from '../../store';
import { PlayerStats } from '../../store/interfaces/playerStats';
import { CardSectorAndTier } from "../../store/interfaces/gameTypes";
import { cardStyles } from '../../styleSheets/card';

interface TutorialCardProps {
    cardInHand: GameCard
}

export default function TutorialCard({ cardInHand }: TutorialCardProps) {
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => {
        return state.playerStats
    })
    const dispatch = useDispatch()
    const sector = cardData[cardInHand.cardId - 1].sector as string
    const tier = cardData[cardInHand.cardId - 1].tier as number
    const name = cardData[cardInHand.cardId - 1].cardName as string
    const cost = cardData[cardInHand.cardId - 1].cost as number
    const cardSectorAndTier = `${sector}${tier}` as CardSectorAndTier
    const tierTax = playerStats.tierData[cardSectorAndTier]

    return (
        <>
            {sector === 'Public' &&
                <Pressable onPress={() => dispatch(setDisplayToCard(cardInHand))} onLongPress={() => dispatch(playCard(cardInHand))} style={({ pressed }) => [cardStyles.cardBody, {
                    backgroundColor: pressed ? 'rgba(109, 116, 179, 0.6)' :
                        tier === 3 ? 'rgba(3, 15, 94,0.6)' :
                            tier === 2 ? 'rgba(35, 48, 145,0.8)' :
                                'rgba(78, 90, 173,0.8)',
                    borderColor: 'black',
                    borderRadius: 2,
                }]}>
                    <Text adjustsFontSizeToFit={true}
                        style={cardStyles.cardText}>${cost + tierTax} {name}</Text>
                </Pressable>
            }
            {sector === 'Residential' &&
                <Pressable onPress={() => dispatch(setDisplayToCard(cardInHand))} onLongPress={() => dispatch(playCard(cardInHand))} style={({ pressed }) => [cardStyles.cardBody, {
                    backgroundColor: pressed ? 'rgba(88, 138, 76, 0.6)' :
                        tier === 3 ? 'rgba(11, 43, 3, 0.6)' :
                            tier === 2 ? 'rgba(23, 69, 15, 0.8)' :
                                'rgba(61, 110, 52, 0.8)',
                    borderColor: 'black',
                    borderRadius: 2,
                }]}>
                    <Text adjustsFontSizeToFit={true} style={cardStyles.cardText}>${cost + tierTax} {name}</Text>
                </Pressable>
            }
            {sector === 'Service' &&
                <Pressable onPress={() => dispatch(setDisplayToCard(cardInHand))} onLongPress={() => dispatch(playCard(cardInHand))} style={({ pressed }) => [cardStyles.cardBody, {
                    backgroundColor: pressed ? 'rgba(214, 164, 39, 0.6)' :
                        tier === 3 ? 'rgba(135, 83, 0, 0.6)' :
                            tier === 2 ? 'rgba(138, 97, 14, 0.8)' :
                                'rgba(184, 136, 6, 0.8)',
                    borderColor: 'black',
                    borderRadius: 2,
                }]}>
                    <Text adjustsFontSizeToFit={true} style={cardStyles.cardText}>${cost + tierTax} {name}</Text>
                </Pressable>
            }
            {sector === 'Industry' &&
                <Pressable onPress={() => dispatch(setDisplayToCard(cardInHand))} onLongPress={() => dispatch(playCard(cardInHand))} style={({ pressed }) => [cardStyles.cardBody, {
                    backgroundColor: pressed ? 'rgba(171, 85, 70, 0.6)' :
                        tier === 3 ? 'rgba(48, 8, 0,0.6)' :
                            tier === 2 ? 'rgba(107, 36, 25,0.8)' :
                                'rgba(158, 72, 57,0.8)',
                    borderColor: 'black',
                    borderRadius: 2,
                }]}>
                    <Text adjustsFontSizeToFit={true} style={cardStyles.cardText}>${cost + tierTax} {name}</Text>
                </Pressable>
            }
        </>
    );
}
