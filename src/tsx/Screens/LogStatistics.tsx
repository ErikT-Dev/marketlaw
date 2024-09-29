import { useSelector } from "react-redux"
import { HighScore } from "../../store/interfaces/highScore"
import { cardData } from "../../store/data"

interface PlayedCardCountElement {
    cardId: number
    cardName: string
    playedCount: number
    gameScores: number[]
    averageScore: number
}

export default function LogStatistics() {
    const season1Games = useSelector((state: {
        fireStoreDB: {
            allGamesData: {
                season1: { games: HighScore[] }
            }
        }
    }) => { return state.fireStoreDB.allGamesData.season1.games as HighScore[] })

    const playedCardsCount = [] as PlayedCardCountElement[]
    cardData.forEach(card => playedCardsCount.push({ cardId: card.cardId, cardName: card.cardName, playedCount: 0, averageScore: 0, gameScores: [] }))
    season1Games.forEach(game => game.playedCards.forEach(card => {
        playedCardsCount[card.cardId - 1].playedCount += 1
        playedCardsCount[card.cardId - 1].gameScores.push(game.score)
    }))
    playedCardsCount.forEach(card => card.averageScore = Math.round(card.gameScores.reduce((partialSum, a) => partialSum + a, 0) / card.playedCount))
    const cleanData = playedCardsCount.map(({ gameScores, ...keepAttrs }) => keepAttrs)

    console.log(JSON.stringify(cleanData))

    return (
        <>
        </>
    )
}