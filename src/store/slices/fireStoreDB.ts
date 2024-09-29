import { createSlice } from "@reduxjs/toolkit";
import { HighScore } from "../interfaces/highScore";
import { Player } from "../interfaces/player";
import { UniqueDate } from "../interfaces/uniqueDate";
import { convertUTCtoDate } from "../functions/convertUTCtoDate";

const fireStoreDBSlice = createSlice({
    name: 'fireStoreDB',
    initialState: {
        players: [] as Player[],
        allGamesData: {
            games: [] as HighScore[],
            dates: [] as UniqueDate[]
        }
    },
    reducers: {
        loadNewGamesFromFireStoreDB(state, action: { payload: { newHighScores: HighScore[] } }) {
            action.payload.newHighScores
                //.sort(function (a, b) {return Date.parse(b.dateAndTimeUTC) - Date.parse(a.dateAndTimeUTC)})
                .forEach(game => {
                    if (!state.allGamesData.games.some(existingGame => existingGame.gameId === game.gameId)) {
                        state.allGamesData.games.push(game)
                        if (!state.allGamesData.dates.some(date => date.dateString === game.gameDate)) {
                            state.allGamesData.dates.push({
                                dateString: game.gameDate,
                                medalsGiven: false,
                                bonusTypes: {
                                    bonusPoints1: game.playedBonusTypes.baseRewardOfType1,
                                    bonusPoints2: game.playedBonusTypes.baseRewardOfType2,
                                    type1: game.playedBonusTypes.bonusType1,
                                    type2: game.playedBonusTypes.bonusType2,
                                }
                            })
                        }
                        if (!state.players.some(player => player.uid === game.userUid)) {
                            state.players.push({ uid: game.userUid, displayName: game.userDisplayName, playedGames: [game], medals: [] })
                        } else {
                            state.players.find(player => player.uid === game.userUid)?.playedGames.push(game)
                        }
                    }
                })

        }, clearLocalStorageOfFireStoreData(state) {
            state.players = []
            state.allGamesData.games = []
            state.allGamesData.dates = []

        }, updatePlayerMedals(state) {
            state.allGamesData.dates.filter(date => !date.medalsGiven && date.dateString !== new Intl.DateTimeFormat('en-GB', {
                dateStyle: 'medium',
                timeZone: 'Etc/GMT-7',
            }).format(new Date())).map((date) => {
                date.medalsGiven = true
                const gamesOfThatDate = state.allGamesData.games.filter(game => game.gameDate === date.dateString && convertUTCtoDate(game.dateAndTimeUTC) === date.dateString)
                const bestGameOfEachPlayer = [] as HighScore[]
                gamesOfThatDate.sort(function (a, b) {
                    return b.score - a.score;
                })
                    .map((game) => {
                        if (!bestGameOfEachPlayer.some(bestGame => bestGame.userUid === game.userUid)) {
                            bestGameOfEachPlayer.push(game)
                        }
                    })
                bestGameOfEachPlayer.map((game, idx) => {
                    if (idx === 0) {
                        state.players.find(player => player.uid === game.userUid)?.medals.push({ season: game.season, points: 10 })
                    } else if (idx === 1) {
                        state.players.find(player => player.uid === game.userUid)?.medals.push({ season: game.season, points: 6 })
                    } else if (idx === 2) {
                        state.players.find(player => player.uid === game.userUid)?.medals.push({ season: game.season, points: 3 })
                    } else {
                        return
                    }
                })

            })
        }
    }
})

export const { loadNewGamesFromFireStoreDB, clearLocalStorageOfFireStoreData, updatePlayerMedals } = fireStoreDBSlice.actions
export const fireStoreDBReducer = fireStoreDBSlice.reducer