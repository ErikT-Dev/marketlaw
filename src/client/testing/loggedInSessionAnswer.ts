import { TEST_PLAYER_ICON } from "../../shared/testing/TEST_PLAYER_ICON";

export function loggedInSessionAnswer(playerId: string, name: string, isGuest: boolean) {
  return { isLoggedIn: true, playerId, name, isGuest, icon: TEST_PLAYER_ICON };
}
