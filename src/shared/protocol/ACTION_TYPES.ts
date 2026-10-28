import { ActionIntent } from "./ActionIntent";

export const ACTION_TYPES: ReadonlyArray<ActionIntent["type"]> = ActionIntent.options.map(
  (option) => option.entries.type.literal,
);
