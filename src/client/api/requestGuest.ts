import type { GuestResponse } from "../../shared/api/GuestResponse";
import { requestAccount } from "./requestAccount";

export async function requestGuest(name: string, humanCheck: string): Promise<GuestResponse> {
  return requestAccount("/api/guests", { name, humanCheck });
}
