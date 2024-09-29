import { configureStore } from "@reduxjs/toolkit";
import {
    persistStore,
    persistReducer,
} from "redux-persist";
import {
    playerStatsReducer,
    setDisplayedCard,
    playCard,
    endTurn,
    increaseIncome,
    convertBonusToFunds,
    sellCard, buyBuildPass,
    checkCombosForCompletion,
    claimCombo,
    updateCombosCount,
    completeAProject,
    trade,
    gainViaInfluence,
    skipBuild,
    buyBuildPassWithInfluence,
    drawViaInfluence,
    updatePlayedBonusTypes,
    restart,
    endGame
} from "./slices/playerStats";
import {
    gamesPlayedOnThisDeviceReducer,
    saveNewScore,
    clearData,
    setGameAsUploaded
} from "./slices/gamesPlayedOnThisDevice";
import {
    currentUserReducer,
    logIn,
    logOut
} from "./slices/currentUser";
import {
    tutorialDataReducer,
    setTutorialData
} from "./slices/tutorialData";
import {
    fireStoreDBReducer,
    loadNewGamesFromFireStoreDB,
    clearLocalStorageOfFireStoreData,
    updatePlayerMedals
} from "./slices/fireStoreDB";
import { currentDateReducer, updateCurrentDate, updateRestartSlots } from "./slices/currentDate";
import AsyncStorage from "@react-native-async-storage/async-storage";

const persistConfig = {
    storage: AsyncStorage,
    key: 'root',
}
const persistedPlayerStats = persistReducer(persistConfig, playerStatsReducer)
const persistedGamesPlayedOnThisDevice = persistReducer(persistConfig, gamesPlayedOnThisDeviceReducer)
const persistedFireStoreDB = persistReducer(persistConfig, fireStoreDBReducer)
const persistedCurrentUser = persistReducer(persistConfig, currentUserReducer)
const persistedTutorialData = persistReducer(persistConfig, tutorialDataReducer)
const persistedCurrentDate = persistReducer(persistConfig, currentDateReducer)

const store = configureStore({
    reducer: {
        playerStats: persistedPlayerStats,
        gamesPlayedOnThisDevice: persistedGamesPlayedOnThisDevice,
        currentUser: persistedCurrentUser,
        tutorialData: persistedTutorialData,
        fireStoreDB: persistedFireStoreDB,
        currentDate: persistedCurrentDate
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
            immutableCheck: false
        }),

})
const persistor = persistStore(store)

export {
    store,
    persistor,
    setDisplayedCard,
    playCard,
    endTurn,
    increaseIncome,
    convertBonusToFunds,
    sellCard,
    buyBuildPass,
    checkCombosForCompletion,
    claimCombo,
    updateCombosCount,
    completeAProject,
    trade,
    gainViaInfluence,
    skipBuild,
    buyBuildPassWithInfluence,
    drawViaInfluence,
    updatePlayedBonusTypes,
    restart,
    endGame,
    saveNewScore,
    setGameAsUploaded,
    clearData,
    logIn,
    logOut,
    setTutorialData,
    loadNewGamesFromFireStoreDB,
    clearLocalStorageOfFireStoreData,
    updatePlayerMedals,
    updateCurrentDate,
    updateRestartSlots
}