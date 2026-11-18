import type { RoomCode } from "../../shared/RoomCode";
import type { RANKED_QUEUE_PLACE } from "./RANKED_QUEUE_PLACE";
import type { TUTORIAL_PLACE } from "./TUTORIAL_PLACE";

export type BusyPlace = RoomCode | typeof RANKED_QUEUE_PLACE | typeof TUTORIAL_PLACE;
