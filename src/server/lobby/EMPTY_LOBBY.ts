import type { LobbyRecord } from "./LobbyRecord";

export const EMPTY_LOBBY: LobbyRecord = {
  rooms: [],
  busy: [],
  staying: [],
  today: { day: 0, players: [], siteGameStarts: 0, siteChatMessages: 0, siteEmails: 0 },
};
