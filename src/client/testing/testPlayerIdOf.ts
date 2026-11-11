import * as v from "valibot";
import { PlayerId } from "../../shared/PlayerId";

export function testPlayerIdOf(number: number): PlayerId {
  return v.parse(PlayerId, `00000000-0000-4000-8000-${String(number).padStart(12, "0")}`);
}
