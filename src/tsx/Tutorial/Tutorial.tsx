import { Text, View, Pressable, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { cardData } from '../../store/data';
import { TutorialData } from '../../store/interfaces/tutorialData';
import { PlayerStats } from '../../store/interfaces/playerStats';
import { setTutorialData } from '../../store';
import GameIcon from '../Icons/GameIcon';
import TutorialCard from './TutorialCard';
import { repeatingElementsStyles } from '../../styleSheets/repeatingElements';

export default function Tutorial() {
    const dispatch = useDispatch()
    const playerStats = useSelector((state: { playerStats: PlayerStats }) => {
        return state.playerStats
    })
    const tutorialData = useSelector((state: { tutorialData: TutorialData }) => {
        return state.tutorialData
    })
    return (
        <>
            {
                tutorialData.tutorialOn &&
                <View style={{
                    backgroundColor: 'rgba(252, 248, 230,0.6)',
                    flex: 1,
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 5,
                    paddingHorizontal: 15,
                    borderTopRightRadius: 10
                }}>
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 5, width: '100%' }}>
                        <Pressable
                            onPress={() => dispatch(setTutorialData({
                                tutorialOn: true,
                                tutorialStep: tutorialData.tutorialStep > 1 ? tutorialData.tutorialStep - 1 : 1
                            }))}
                            style={({ pressed }) => [{
                                backgroundColor: tutorialData.tutorialStep < 2 ? '#5f5d61' : pressed ? '#78599c' : '#392a4a',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderColor: 'black',
                                flex: 0.33,
                                paddingVertical: 10
                            }]}>
                            <Text style={{ fontSize: 14, color: 'white', fontWeight: "600", fontFamily: 'Roboto', }}>Back</Text>
                        </Pressable>
                        <Pressable
                            style={{
                                backgroundColor: '#e4d5f5',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderColor: 'black',
                                flex: 0.34,
                                paddingVertical: 10,
                            }}>
                            <Text style={{ fontSize: 14, color: '#392a4a', fontWeight: "600", fontFamily: 'Roboto', }}>{tutorialData.tutorialStep}/12</Text>
                        </Pressable>
                        <Pressable
                            onPress={() => dispatch(setTutorialData({
                                tutorialOn: true,
                                tutorialStep: tutorialData.tutorialStep < 12 ? tutorialData.tutorialStep + 1 : 12
                            }))}
                            style={({ pressed }) => [{
                                backgroundColor: tutorialData.tutorialStep > 11 ? '#5f5d61' : pressed ? '#78599c' : '#392a4a',
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderColor: 'black',
                                flex: 0.33,
                                paddingVertical: 10,
                                borderTopRightRadius: 10
                            }]}>
                            <Text style={{ fontSize: 14, color: 'white', fontWeight: "600", fontFamily: 'Roboto', }}>Next</Text>
                        </Pressable>
                    </View>
                    {tutorialData.tutorialStep === 1 &&
                        <ScrollView>
                            <Text style={repeatingElementsStyles.tutorialText}>
                                Welcome to Market Law!
                            </Text>
                            <Text style={repeatingElementsStyles.tutorialText}>
                                To get you started here is a short overview of how the game is played.
                            </Text>
                            <Text style={repeatingElementsStyles.tutorialText}>
                                Press 'next' to continue.
                            </Text>
                        </ScrollView>}
                    {tutorialData.tutorialStep === 2 &&
                        <ScrollView>
                            <Text style={repeatingElementsStyles.tutorialText}>
                                The game is played in turns. For the most part each turn you play one card from your hand and then pass the turn. To play a card from your hand all you need is to pay the cost of the card.
                            </Text>
                        </ScrollView>}
                    {tutorialData.tutorialStep === 3 &&
                        <ScrollView>
                            <Text style={repeatingElementsStyles.tutorialText}>
                                You can see the cards in your hand listed under the 'HAND' button. For example:
                            </Text>
                            <View style={{ width: '50%', height: 45 }}>
                                <TutorialCard
                                    cardInHand={playerStats.cardsInHand[0]}
                                />
                            </View>
                        </ScrollView>}
                    {tutorialData.tutorialStep === 4 &&
                        <ScrollView>
                            <Text style={repeatingElementsStyles.tutorialText}>
                                You can tap on the cards in your hand to view them or you can hold your finger on them in order to play them.
                                {playerStats.playedCards.length === 0 && ` Try playing '${cardData[playerStats.cardsInHand[0].cardId - 1].cardName}'.`}
                            </Text>
                        </ScrollView>}
                    {tutorialData.tutorialStep === 5 &&
                        <ScrollView>
                            <Text style={repeatingElementsStyles.tutorialText}>
                                Whenever you play a card your statsboard (the rightmost) is updated based on the values on the card.
                            </Text>
                        </ScrollView>}
                    {tutorialData.tutorialStep === 6 &&
                        <ScrollView>
                            <Text style={repeatingElementsStyles.tutorialText}>Here is an overview of all the icons in the statsboard:  </Text>
                            <View style={repeatingElementsStyles.tutorialElement}>
                                <GameIcon stat={'cost'} />
                                <Text style={repeatingElementsStyles.tutorialText}> - funds  </Text>
                            </View>
                            <View style={repeatingElementsStyles.tutorialElement}>
                                <GameIcon stat={'workforce'} />
                                <Text style={repeatingElementsStyles.tutorialText}> - workforce  </Text>
                            </View>
                            <View style={repeatingElementsStyles.tutorialElement}>
                                <GameIcon stat={'quality'} />
                                <Text style={repeatingElementsStyles.tutorialText}> - quality  </Text>
                            </View>
                            <View style={repeatingElementsStyles.tutorialElement}>
                                <GameIcon stat={'satisfaction'} />
                                <Text style={repeatingElementsStyles.tutorialText}> - satisfaction  </Text>
                            </View>
                            <View style={repeatingElementsStyles.tutorialElement}>
                                <GameIcon stat={'product'} />
                                <Text style={repeatingElementsStyles.tutorialText}> - product  </Text>
                            </View>
                            <View style={repeatingElementsStyles.tutorialElement}>
                                <GameIcon stat={'sales'} />
                                <Text style={repeatingElementsStyles.tutorialText}> - sales  </Text>
                            </View>
                            <View style={repeatingElementsStyles.tutorialElement}>
                                <GameIcon stat={'Tutorial Income'} />
                                <Text style={repeatingElementsStyles.tutorialText}> - income  </Text>
                            </View>
                            <View style={repeatingElementsStyles.tutorialElement}>
                                <GameIcon stat={'Tutorial Bonus'} />
                                <Text style={repeatingElementsStyles.tutorialText}> - bonus  </Text>
                            </View>
                            <View style={repeatingElementsStyles.tutorialElement}>
                                <GameIcon stat={'Tutorial Turns played'} />
                                <Text style={repeatingElementsStyles.tutorialText}> - number of turns played  </Text>
                            </View>
                            <View style={repeatingElementsStyles.tutorialElement}>
                                <GameIcon stat={'Tutorial Cards played'} />
                                <Text style={repeatingElementsStyles.tutorialText}> - number of cards played  </Text>
                            </View>
                            <Text style={repeatingElementsStyles.tutorialText}>For more information tap on the icons in your statsboard.</Text>
                        </ScrollView>}
                    {tutorialData.tutorialStep === 7 &&
                        <ScrollView>
                            <Text style={repeatingElementsStyles.tutorialText}>
                                Playing a card also grants you all the types and demands listed on that card.
                                Each demand has a reward, which you can claim if you've fulfilled its requirements.
                            </Text>
                        </ScrollView>}
                    {tutorialData.tutorialStep === 8 &&
                        <ScrollView>
                            <Text style={repeatingElementsStyles.tutorialText}>
                                To win the game you must acquire 22 income and complete 3 projects. To gain an income you must have at least 1 leftover product and sales and your workforce, quality and satisfaction all must be 0 or higher. Whenever you gain an income it consumes 1 product and 1 sales and you draw a random card. The goal of the game is to end the game with as few turns as possible.
                            </Text>
                        </ScrollView>}
                    {tutorialData.tutorialStep === 9 &&
                        <ScrollView>
                            <Text style={repeatingElementsStyles.tutorialText}>
                                There are 4 types of cards: Residential (green), Industrial (red), Service (yellow) and Public (blue).
                                Additionally each sector is divided into 3 tiers, marked by the cube icon on the topright corner of each card. Whenever you play a card each future card of same tier and sector will cost 1 more to play.
                            </Text>
                        </ScrollView>}
                    {tutorialData.tutorialStep === 10 &&
                        <ScrollView>
                            <Text style={repeatingElementsStyles.tutorialText}>
                                Other actions you can take during each turn: (1) you can sell cards from your hand.
                                To toggle selling tap on the 'HAND' button. (2) You can complete projects. For more information about projects tap on the 'projects' button. (3) You can buy build pass to be able to play more cards.
                                (4) You can use trading by tapping the 'TRADE' button.
                            </Text>
                        </ScrollView>}

                    {tutorialData.tutorialStep === 11 &&
                        <ScrollView>
                            <Text style={repeatingElementsStyles.tutorialText}>
                                In addition to income you earn funds through bonus.
                                Your bonus is calculated at the end of each turn based on your leftover stats.
                                For each workforce, quality and satisfaction you gain (or lose) 1 of bonus (based on whether the value is negative).
                                For each product you gain 4 bonus and for eash sale 3.
                                Whenever your bonus reaches 10 you're given 1 of funds and the bonus goes back to 0.
                                On average the bonus accounts for roughly up to 2 extra funds each turn.
                            </Text>
                        </ScrollView>}

                    {tutorialData.tutorialStep === 12 &&
                        <ScrollView>
                            <Text style={repeatingElementsStyles.tutorialText}>
                                This is the end of the tutorial.
                                Most icons and various buttons inside the game can also be tapped on for extra information.
                                You can always review the rules from the menu page.
                            </Text>
                        </ScrollView>}
                    <Pressable
                        onPress={() => dispatch(setTutorialData({
                            tutorialOn: false,
                            tutorialStep: tutorialData.tutorialStep
                        }))}
                        style={({ pressed }) => [{
                            backgroundColor: pressed ? '#f1e8fa' : '#d8d1e0',
                            width: '70%',
                            height: 30,
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 5,
                            borderWidth: 1,
                            borderColor: 'black',
                            marginTop: 10
                        }]}>
                        <Text style={{ fontSize: 14, color: '#392a4a', fontWeight: "600", fontFamily: 'Roboto', }}>
                            {tutorialData.tutorialStep < 12 ? 'SKIP TUTORIAL' : 'CLOSE'}
                        </Text>
                    </Pressable>
                </View>
            }
        </>
    );
}