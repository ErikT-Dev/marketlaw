import * as v from "valibot";
import { GuestResponse } from "../../shared/api/GuestResponse";
import { postJson } from "./postJson";

export async function requestGuest(name: string): Promise<GuestResponse | null> {
  const parsed = v.safeParse(GuestResponse, await postJson("/api/guests", { name }, null));
  return parsed.success ? parsed.output : null;
}
