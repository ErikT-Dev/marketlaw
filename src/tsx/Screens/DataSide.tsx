import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { FIRESTORE_DB } from '../../../FirebaseConfig';
import { setGameAsUploaded, loadNewGamesFromFireStoreDB, updatePlayerMedals, updateCurrentDate } from '../../store';
import { HighScore } from '../../store/interfaces/highScore';

const MAX_GAMES = 150;
const MATCH_HISTORY_DOC = 'Marek/Match History';

export default function DataSide() {
    const dispatch = useDispatch();
    const gamesPlayedOnThisDevice = useSelector((state: { gamesPlayedOnThisDevice: { finishedGames: HighScore[] } }) =>
        state.gamesPlayedOnThisDevice.finishedGames
    );

    const updateMatchHistory = useCallback(async (game: HighScore) => {
        const matchHistoryRef = doc(FIRESTORE_DB, MATCH_HISTORY_DOC);

        try {
            const docSnap = await getDoc(matchHistoryRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                let games = data.games || [];

                if (games.length >= MAX_GAMES) {
                    const oldestGame = games[0];
                    await updateDoc(matchHistoryRef, {
                        games: arrayRemove(oldestGame)
                    });
                }

                await updateDoc(matchHistoryRef, {
                    games: arrayUnion(game)
                });
            } else {
                await updateDoc(matchHistoryRef, {
                    games: [game]
                });
            }
            dispatch(setGameAsUploaded(game));
        } catch (error) {
            console.error("Error updating Match History: ", error);
        }
    }, [dispatch]);

    useEffect(() => {
        const gamesToUpload = gamesPlayedOnThisDevice.filter((score) => score.userUid && !score.uploadedToDb);
        gamesToUpload.forEach(updateMatchHistory);
    }, [gamesPlayedOnThisDevice, updateMatchHistory]);

    useEffect(() => {
        const matchHistoryRef = doc(FIRESTORE_DB, MATCH_HISTORY_DOC);

        const unsubscribe = onSnapshot(matchHistoryRef, {
            next: (docSnapshot) => {
                if (docSnapshot.exists()) {
                    const data = docSnapshot.data();
                    const newMatches = data.games || [];
                    dispatch(loadNewGamesFromFireStoreDB({ newHighScores: newMatches }));
                    dispatch(updatePlayerMedals());
                } else {
                    console.log("No such document!");
                }
            },
            error: (error) => {
                console.error("Error fetching Match History:", error);
            }
        });

        return () => unsubscribe();
    }, [dispatch]);

    useEffect(() => {
        const timer = setInterval(() => {
            dispatch(updateCurrentDate());
        }, 60000);
        return () => clearInterval(timer);
    }, [dispatch]);

    return null;
}