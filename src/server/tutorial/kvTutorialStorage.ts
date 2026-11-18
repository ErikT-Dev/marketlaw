import * as v from "valibot";
import { STORED_TUTORIAL_SCHEMA } from "./STORED_TUTORIAL_SCHEMA";
import type { TutorialStorage } from "./TutorialStorage";

const TUTORIAL_KEY = "tutorial";

export function kvTutorialStorage(kv: SyncKvStorage): TutorialStorage {
  return {
    read: () => {
      const parsed = v.safeParse(STORED_TUTORIAL_SCHEMA, kv.get(TUTORIAL_KEY));
      return parsed.success ? parsed.output : undefined;
    },
    write: (record) => {
      kv.put(TUTORIAL_KEY, record);
    },
    remove: () => {
      kv.delete(TUTORIAL_KEY);
    },
  };
}
