import { HighScore } from "../interfaces/highScore";

export const findDataForGamesOfThatDate = (
    date: string,
    requestedValue: 'playerWithHighestScore' | 'gamesCount' | 'highestScore',
    gamesList: readonly HighScore[]
): string | number | undefined => {
    const gamesOfThatDay = gamesList.filter((score) => score.gameDate === date);

    if (requestedValue === 'gamesCount') {
        return gamesOfThatDay.length;
    }

    if (gamesOfThatDay.length === 0) {
        return requestedValue === 'highestScore' ? '0.0' : undefined;
    }

    const highestScoreGame = gamesOfThatDay.reduce(
        (prev, current) => (prev.score > current.score ? prev : current)
    );

    switch (requestedValue) {
        case 'playerWithHighestScore':
            return highestScoreGame.userDisplayName;
        case 'highestScore':
            return (Math.round(highestScoreGame.score * 10) / 10).toFixed(1);
        default:
            return undefined;
    }
};