import * as v from "valibot";

export const TURNSTILE_API = v.looseObject({
  render: v.function(),
  remove: v.function(),
});

export type TurnstileApi = v.InferOutput<typeof TURNSTILE_API>;
