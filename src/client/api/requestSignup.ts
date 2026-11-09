import type { GuestResponse } from "../../shared/api/GuestResponse";
import type { SignupRequest } from "../../shared/api/SignupRequest";
import { requestAccount } from "./requestAccount";

export async function requestSignup(signup: SignupRequest): Promise<GuestResponse> {
  return requestAccount("/api/signups", signup);
}
