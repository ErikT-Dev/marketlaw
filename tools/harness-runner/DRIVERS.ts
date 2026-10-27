import { ENGINE_DRIVER } from "./engine/ENGINE_DRIVER.ts";
import { ROOM_DRIVER } from "./room/ROOM_DRIVER.ts";
import type { ScenarioDriver } from "./ScenarioDriver.ts";

export const DRIVERS: ReadonlyArray<ScenarioDriver> = [ENGINE_DRIVER, ROOM_DRIVER];
