import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { calcInitialPlayerStats } from "../functions/calcInitialPlayerStats";
import { cardData } from "../data";
import * as basicHelperFunctions from "../functions/basicHelperFunctions";
import { GameCard } from "../interfaces/cardInAction";
import { drawCards } from "../functions/drawCards";
import { showMessage, hideMessage } from "react-native-flash-message";
import { Combo } from "../interfaces/combo";
import * as comboHelperFunctions from "../functions/comboHelperFunctions";
import { Project } from "../interfaces/project";
import { PlayerStats } from "../interfaces/playerStats";
import { SectorTypes, TierTypes } from "../interfaces/gameTypes";
import { sumUpTwoArraysByTypeCount } from "../functions/sumUpTwoTypeArrays";

interface DrawViaInfluencePayload {
    tier: TierTypes;
    sector: SectorTypes;
    publicCardType?: "Quality" | "Satisfaction";
}

const playerStatsSlice = createSlice({
    name: 'playerStats',
    initialState: calcInitialPlayerStats(),
    reducers: {
        setDisplayedCard(state, action: PayloadAction<GameCard>) {
            if (action.payload !== null) {
                state.displayedCard = action.payload
            }
        },
        playCard(state, action: PayloadAction<GameCard>) {
            if (!state.skippedBuildThisTurn) {
                if (action.payload.tier !== 1 && state.turnsPlayed < 4) {
                    showMessage({
                        message: "Tier 2 or 3 cards can only be played starting from turn 4.",
                        type: "danger",
                        onPress: () => hideMessage()
                    })
                } else if (!state.playedCardThisTurn || state.buildPassesRemaining > 0) {
                    if (state.funds >= (action.payload.cost + basicHelperFunctions.calcTierTax(state.tierData, action.payload))) {
                        state.funds -= action.payload.cost + basicHelperFunctions.calcTierTax(state.tierData, action.payload)
                        state.workforce = basicHelperFunctions.calcWorkforce(state.workforce, action.payload)
                        state.quality = basicHelperFunctions.calcQuality(state.quality, action.payload)
                        state.satisfaction = basicHelperFunctions.calcSatisfaction(state.satisfaction, action.payload)
                        state.product += cardData[action.payload.cardId - 1].product
                        state.sales += cardData[action.payload.cardId - 1].sales
                        const playedCardTypes = cardData[action.payload.cardId - 1].types;
                        state.types = sumUpTwoArraysByTypeCount(...state.types, ...playedCardTypes)
                        const newCombos = cardData[action.payload.cardId - 1].combos;
                        state.playedCombos = [...newCombos, ...state.playedCombos];
                        state.tierData = basicHelperFunctions.updateTierData(state.tierData, action.payload)

                        const card = state.gameCards[action.payload.cardId - 1];
                        if (card) {
                            card.location = "Play";
                            card.newInHand = false;
                        }

                        if (!state.playedCardThisTurn) {
                            state.playedCardThisTurn = true
                        } else {
                            state.buildPassesRemaining -= 1
                        }
                    } else {
                        showMessage({
                            message: "You don't have enough funds to play this card.",
                            type: "danger",
                            onPress: () => hideMessage()
                        })
                    }
                } else {
                    showMessage({
                        message: "You may only play one card per turn, unless you use build pass.",
                        type: "warning",
                        onPress: () => hideMessage()
                    })
                }
            } else {
                showMessage({
                    message: "You can't play any cards during this turn.",
                    type: "warning",
                    onPress: () => hideMessage()
                })
            }
        },

        endTurn(state, action: PayloadAction<SectorTypes>) {
            state.turnsPlayed += 1
            state.influence += 1
            state.funds += state.income
            state.bonus += state.workforce + state.quality + state.satisfaction + 4 * state.product + 3 * state.sales
            state.playedCardThisTurn = false
            state.skippedBuildThisTurn = false

            const updatedCards = drawCards({
                allCards: state.gameCards.map(card => ({
                    ...card,
                    newInHand: false
                })),
                numberToDraw: 2,
                turnsPlayed: state.turnsPlayed,
                sectorToDrawFrom: action.payload
            });
            state.gameCards = updatedCards;
        },

        increaseIncome(state) {
            if (state.workforce >= 0 && state.quality >= 0 && state.satisfaction >= 0 && state.product > 0 && state.sales > 0) {
                const updatedCards = drawCards({
                    allCards: state.gameCards,
                    numberToDraw: 1,
                    turnsPlayed: state.turnsPlayed
                });
                state.income += 1
                state.product -= 1
                state.sales -= 1
                state.gameCards = updatedCards;
            }
        },

        convertBonusToFunds(state) {
            if (state.bonus > 9) {
                state.bonus -= 10
                state.funds += 1
            }
        },

        sellCard(state, action: PayloadAction<GameCard>) {
            state.funds += 1;
            const card = state.gameCards[action.payload.cardId - 1];
            if (card) {
                card.location = "Sold";
                card.newInHand = false;
            }
        },

        buyBuildPass(state) {
            if (state.playedCardThisTurn) {
                if (state.buildPassesRemaining < 1) {
                    if (state.funds >= (2 + state.timesUsedBuildPass)) {
                        state.funds -= 2 + state.timesUsedBuildPass
                        state.buildPassesRemaining += 1
                        state.timesUsedBuildPass += 1
                    }
                    else {
                        showMessage({
                            message: "You don't have enough funds to buy build pass.",
                            type: "danger",
                            onPress: () => hideMessage()
                        })
                    }
                } else {
                    showMessage({
                        message: "You already have a build pass.",
                        type: "warning",
                        onPress: () => hideMessage()
                    })
                }
            } else {
                showMessage({
                    message: "The first card you play each turn doesn't require build pass.",
                    type: "warning",
                    onPress: () => hideMessage()
                })
            }
        },
        checkCombosForCompletion(state) {
            if (state.playedCombos.length > 0) {
                const playedCards = state.gameCards.filter(card => card.location === "Play");
                state.playedCombos.forEach(combo => {
                    if (combo.reqType) {
                        if (state.types.some(e => e.type === combo.reqType && e.count >= combo.reqN * combo.claims)) {
                            combo.complete = true
                        } else {
                            combo.complete = false
                        }
                    } else {
                        if (
                            playedCards.some(e => e.cardId === combo.reqCard)
                        ) {
                            combo.complete = true
                        }
                    }
                });
            }
        },

        claimCombo(state, action: PayloadAction<Combo>) {
            const playedReqType = action.payload.infinite ? state.types.find(type => type.type === action.payload.reqType)?.count : undefined
            if (action.payload.complete) {
                state.workforce = comboHelperFunctions.claimComboWorkforce(state.workforce, action.payload)
                state.quality = comboHelperFunctions.claimComboQuality(state.quality, action.payload)
                state.satisfaction = comboHelperFunctions.claimComboSatisfation(state.satisfaction, action.payload)
                state.playedCombos = comboHelperFunctions.updateCombo(state.playedCombos, action.payload, playedReqType)
            } else {
                showMessage({
                    message: "You haven't met the demand.",
                    type: "danger",
                    onPress: () => hideMessage()
                })
            }
        },

        updateCombosCount(state) {
            state.playedCombos.forEach((combo) => {
                combo.regularReqTypeCount = state.playedCombos.filter(el => !el.infinite).filter(el => el.reqType === combo.reqType).length
                combo.infiniteReqTypeCount = state.playedCombos.filter(el => el.infinite).filter(el => el.reqType === combo.reqType).filter(el => el.reqN === 1).length
            })
        },

        completeAProject(state: PlayerStats, action: PayloadAction<Project>) {
            if (state[action.payload.costType] >= action.payload.costCount && state.workforce >= 0 && state.quality >= 0 && state.satisfaction >= 0) {
                state.projects = state.projects.map(project =>
                    project.projectId === action.payload.projectId ? { ...project, complete: true } : project
                )

                if (state.projects.every(project => project.complete)) {
                    state[action.payload.costType] -= 8
                    state.income += 2
                    state.funds += 4
                    state.influence += 6
                    state.gameCards = drawCards({
                        allCards: state.gameCards,
                        numberToDraw: 2,
                        turnsPlayed: state.turnsPlayed
                    });
                    showMessage({
                        message: `Successfully completed '${action.payload.projectName}'! All projects are now completed!`,
                        type: "success",
                        onPress: () => hideMessage()
                    })
                } else {
                    state[action.payload.costType] -= 8
                    state.income += 1
                    state.funds += 2
                    state.influence += 3
                    state.gameCards = drawCards({
                        allCards: state.gameCards,
                        numberToDraw: 1,
                        turnsPlayed: state.turnsPlayed
                    });
                    showMessage({
                        message: `Successfully completed '${action.payload.projectName}'!`,
                        type: "success",
                        onPress: () => hideMessage()
                    })
                }
            } else {
                showMessage({
                    message: "You haven't met the requirements.",
                    type: "danger",
                    onPress: () => hideMessage()
                })
            }
        },

        trade(state, action: { payload: "QforS" | "SforQ" | "Qfor2S" | "Sfor2Q" | "SSforP" | "PforS" | "QforW" | "SforW" | "WforQ" | "WforS" | "FforI" | "Wfor4Q" | "Wfor4S" }) {
            if (action.payload === 'SforQ' && state.satisfaction > 0 && state.influence > 0) {
                state.influence -= 1
                state.satisfaction -= 1
                state.quality += 1
                state.influenceUses.SforQ += 1
            } else if (action.payload === 'QforS' && state.quality > 0 && state.influence > 0) {
                state.influence -= 1
                state.satisfaction += 1
                state.quality -= 1
                state.influenceUses.QforS += 1
            } else if (action.payload === 'Qfor2S' && state.satisfaction > 1) {
                state.satisfaction -= 2
                state.quality += 1
            } else if (action.payload === 'Sfor2Q' && state.quality > 1) {
                state.quality -= 2
                state.satisfaction += 1
            } else if (action.payload === 'SSforP' && state.sales > 0 && state.satisfaction > 0 && state.influence > 1) {
                state.influence -= 2
                state.sales -= 1
                state.satisfaction -= 1
                state.product += 1
                state.influenceUses.SSforP += 1
            } else if (action.payload === 'PforS' && state.product > 0 && state.influence > 1) {
                state.influence -= 2
                state.sales += 1
                state.satisfaction += 1
                state.product -= 1
                state.influenceUses.PforS += 1
            } else if (action.payload === 'QforW' && state.quality > 0 && state.influence > 1) {
                state.influence -= 2
                state.workforce += 1
                state.quality -= 1
                state.influenceUses.QforW += 1
            } else if (action.payload === 'SforW' && state.satisfaction > 0 && state.influence > 1) {
                state.influence -= 2
                state.workforce += 1
                state.satisfaction -= 1
                state.influenceUses.SforW += 1
            } else if (action.payload === 'WforQ' && state.workforce > 0) {
                state.workforce -= 1
                state.quality += 1
                state.influenceUses.WforQ += 1
            } else if (action.payload === 'WforS' && state.workforce > 0) {
                state.workforce -= 1
                state.satisfaction += 1
                state.influenceUses.WforS += 1
            } else if (action.payload === 'Wfor4S' && state.satisfaction > 3) {
                state.workforce += 1
                state.satisfaction -= 4
            } else if (action.payload === 'Wfor4Q' && state.quality > 3) {
                state.workforce += 1
                state.quality -= 4
                state.influenceUses.WforS += 1
            } else if (action.payload === 'FforI' && state.funds > 0) {
                state.influence += 1
                state.funds -= 1
            } else {
                showMessage({
                    message: "You lack resources to do that.",
                    type: "danger",
                    onPress: () => hideMessage()
                })
            }
        },

        gainViaInfluence(state, action: { payload: "gain1Q" | "gain1S" | "gain1W" | "gain2F" }) {
            if (action.payload === 'gain1Q' && state.influence > 3) {
                state.influence -= 4
                state.quality += 1
                state.influenceUses.gain1Q += 1
            } else if (action.payload === 'gain1S' && state.influence > 3) {
                state.influence -= 4
                state.satisfaction += 1
                state.influenceUses.gain1S += 1
            } else if (action.payload === 'gain1W' && state.influence > 5) {
                state.influence -= 6
                state.workforce += 1
                state.influenceUses.gain1W += 1
            } else if (action.payload === 'gain2F' && state.influence > 3) {
                state.influence -= 4
                state.funds += 2
                state.influenceUses.gain2F += 1
            } else {
                showMessage({
                    message: "You don't have enough influence to do that.",
                    type: "danger",
                    onPress: () => hideMessage()
                })
            }
        },

        buyBuildPassWithInfluence(state) {
            if (state.playedCardThisTurn) {
                if (state.buildPassesRemaining < 1) {
                    if (state.influence > 4) {
                        state.influence -= 5
                        state.buildPassesRemaining += 1
                        state.influenceUses.gainBP += 1
                    }
                    else {
                        showMessage({
                            message: "You don't have enough influence to buy build pass.",
                            type: "danger",
                            onPress: () => hideMessage()
                        })
                    }
                } else {
                    showMessage({
                        message: "You already have a build pass.",
                        type: "warning",
                        onPress: () => hideMessage()
                    })
                }

            } else {
                showMessage({
                    message: "The first card you play each turn doesn't require build pass.",
                    type: "warning",
                    onPress: () => hideMessage()
                })
            }
        },

        skipBuild(state) {
            if (!state.playedCardThisTurn) {
                if (!state.skippedBuildThisTurn) {
                    state.skippedBuildThisTurn = true
                    state.buildPassesRemaining += 1
                    state.influenceUses.skipBuildForBP += 1
                } else {
                    showMessage({
                        message: "You can only use this option once per turn.",
                        type: "danger",
                        onPress: () => hideMessage()
                    })
                }
            } else {
                showMessage({
                    message: "This option is only for when you haven't played any cards that turn.",
                    type: "danger",
                    onPress: () => hideMessage()
                })
            }
        },

        drawViaInfluence(state, action: PayloadAction<DrawViaInfluencePayload>) {
            const { tier, sector, publicCardType } = action.payload;
            if (state.influence > 1 + tier) {
                const updatedCards = drawCards({
                    allCards: state.gameCards,
                    numberToDraw: 1,
                    turnsPlayed: state.turnsPlayed,
                    sectorToDrawFrom: sector,
                    tierToDrawFrom: tier,
                    publicCardType: sector === "Public" ? publicCardType : "Any"
                });
                state.influence -= 2 + tier;
                state.gameCards = updatedCards;
            } else {
                showMessage({
                    message: "You don't have enough influence to do that.",
                    type: "danger",
                    onPress: () => hideMessage()
                });
            }
        },

        updatePlayedBonusTypes(state) {
            const playedType1 = state.types.find(type => type.type === state.playedBonusTypes.bonusType1)?.count || 0
            const playedType2 = state.types.find(type => type.type === state.playedBonusTypes.bonusType2)?.count || 0
            const baseRewardOfType1 = state.playedBonusTypes.baseRewardOfType1
            const baseRewardOfType2 = state.playedBonusTypes.baseRewardOfType2
            const potentialRewardFromType1 = playedType1 * baseRewardOfType1
            const potentialRewardFromType2 = playedType2 * baseRewardOfType2
            const potentialTotalReward = potentialRewardFromType1 + potentialRewardFromType2
            const totalReceivedReward = potentialTotalReward < 30 ? potentialTotalReward : 30
            state.playedBonusTypes.playedType1 = playedType1
            state.playedBonusTypes.playedType2 = playedType2
            state.playedBonusTypes.totalReceivedReward = totalReceivedReward
        },

        restart() {
            const newPlayerStats = calcInitialPlayerStats()
            return { ...newPlayerStats, gameRunning: true }
        },

        endGame(state) {
            state.gameRunning = false
            showMessage({
                message: `Game finished in ${state.turnsPlayed} turns.`,
                type: "success",
                duration: 2000,
                onPress: () => hideMessage()
            })
        }
    }
})

export const {
    setDisplayedCard, playCard, endTurn, increaseIncome, convertBonusToFunds, sellCard,
    buyBuildPass, checkCombosForCompletion, claimCombo, updateCombosCount,
    completeAProject, trade, gainViaInfluence, skipBuild,
    buyBuildPassWithInfluence, drawViaInfluence, updatePlayedBonusTypes, restart, endGame
} = playerStatsSlice.actions

export const playerStatsReducer = playerStatsSlice.reducer