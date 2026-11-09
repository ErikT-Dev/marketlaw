import type { GuestResponse } from "../../shared/api/GuestResponse";
import type { UsernameChangeRequest } from "../../shared/api/UsernameChangeRequest";
import { requestAccount } from "./requestAccount";

export async function requestUsernameChange(change: UsernameChangeRequest): Promise<GuestResponse> {
  return requestAccount("/api/username-changes", change);
}
