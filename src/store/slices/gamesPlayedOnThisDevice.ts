import { createSlice } from "@reduxjs/toolkit";
import { HighScore } from "../interfaces/highScore";
import { PlayerStats } from "../interfaces/playerStats";
import uuid from 'react-native-uuid';
import { CurrentUser } from "../interfaces/currentUser";
import { currentSeason } from "../data";

const gamesPlayedOnThisDeviceSlice = createSlice({
    name: 'gamesPlayedOnThisDevice',
    initialState: {
        finishedGames: [] as HighScore[]
    },
    reducers: {
        saveNewScore(state, action: { payload: { playerStats: PlayerStats, currentUser: CurrentUser } }) {
            const fundsAndCardsInHand = action.payload.playerStats.funds + action.payload.playerStats.gameCards.filter(card => card.location === "Hand").length
            state.finishedGames.push({
                userUid: action.payload.currentUser.uid,
                userDisplayName: action.payload.currentUser.displayName,
                uploadedToDb: false,
                dateAndTimeUTC: new Date().toUTCString(),
                season: currentSeason,
                gameId: uuid.v4(),
                turnsPlayed: action.payload.playerStats.turnsPlayed,
                funds: fundsAndCardsInHand,
                workforce: action.payload.playerStats.workforce,
                quality: action.payload.playerStats.quality,
                satisfaction: action.payload.playerStats.satisfaction,
                product: action.payload.playerStats.product,
                sales: action.payload.playerStats.sales,
                income: action.payload.playerStats.income,
                types: action.payload.playerStats.types,
                playedBonusTypes: action.payload.playerStats.playedBonusTypes,
                gameDate: action.payload.playerStats.gameDate,
                score: (
                    870
                    - action.payload.playerStats.turnsPlayed * 25
                    + action.payload.playerStats.income * 6.5
                    + action.payload.playerStats.workforce * 0.7
                    + action.payload.playerStats.quality * 0.55
                    + action.payload.playerStats.satisfaction * 0.5
                    + action.payload.playerStats.product * 2.75
                    + action.payload.playerStats.sales * 2.25
                    + fundsAndCardsInHand * 0.2
                    + action.payload.playerStats.playedBonusTypes.totalReceivedReward
                )
            } as HighScore)
        },
        clearData(state) {
            state.finishedGames = []
        },
        setGameAsUploaded(state, action: { payload: HighScore }) {
            state.finishedGames.map((game) => {
                if (game.gameId === action.payload.gameId) {
                    game.uploadedToDb = true
                }
            })
        }
    }
})

export const { saveNewScore, clearData, setGameAsUploaded } = gamesPlayedOnThisDeviceSlice.actions
export const gamesPlayedOnThisDeviceReducer = gamesPlayedOnThisDeviceSlice.reducer