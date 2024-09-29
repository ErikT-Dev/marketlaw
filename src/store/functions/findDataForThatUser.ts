import { HighScore } from "../interfaces/highScore";
import { Player } from "../interfaces/player";

export const findDataForThatUser = (
    player: Player,
    requestedValue: 'highestScore' | 'gamesCount' | 'rankPoints',
    gamesList: readonly HighScore[],
    selectedSeason: number
): string | number => {
    const gamesOfThatUser = gamesList.filter(
        (score) => score.userUid === player.uid && score.season === selectedSeason
    );

    switch (requestedValue) {
        case 'gamesCount':
            return gamesOfThatUser.length;
        case 'highestScore':
            if (gamesOfThatUser.length === 0) return '0.0';
            const highestScore = Math.max(...gamesOfThatUser.map(game => game.score));
            return (Math.round(highestScore * 10) / 10).toFixed(1);
        case 'rankPoints':
            const medals = player.medals.filter(medal => medal.season === selectedSeason);
            return medals.reduce((acc, curr) => acc + curr.points, 0);
        default:
            return 0;
    }
};