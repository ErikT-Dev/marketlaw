import * as v from "valibot";
import { PlayerId } from "../../shared/PlayerId";
import { RoomCode } from "../../shared/RoomCode";
import { EMPTY_LOBBY } from "./EMPTY_LOBBY";
import { RANKED_QUEUE_PLACE } from "./RANKED_QUEUE_PLACE";
import { TUTORIAL_PLACE } from "./TUTORIAL_PLACE";

const COUNT = v.pipe(v.number(), v.integer(), v.minValue(0));

export const LOBBY_RECORD_SCHEMA = v.object({
  rooms: v.array(
    v.object({
      code: RoomCode,
      size: v.picklist([2, 3, 4]),
      isPublic: v.boolean(),
      isWaiting: v.boolean(),
      isOver: v.boolean(),
      players: v.array(v.object({ playerId: PlayerId, name: v.string() })),
      freePlayers: v.array(PlayerId),
    }),
  ),
  busy: v.array(
    v.object({
      playerId: PlayerId,
      code: v.union([RoomCode, v.literal(RANKED_QUEUE_PLACE), v.literal(TUTORIAL_PLACE)]),
    }),
  ),
  staying: v.array(v.object({ playerId: PlayerId, code: RoomCode })),
  today: v.optional(
    v.object({
      day: COUNT,
      players: v.array(v.object({ playerId: PlayerId, actions: COUNT, gameStarts: COUNT })),
      siteGameStarts: COUNT,
      siteChatMessages: v.optional(COUNT, 0),
      siteEmails: v.optional(COUNT, 0),
      siteTutorialStarts: v.optional(COUNT, 0),
    }),
    EMPTY_LOBBY.today,
  ),
});
