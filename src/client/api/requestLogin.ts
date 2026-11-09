import type { GuestResponse } from "../../shared/api/GuestResponse";
import type { LoginRequest } from "../../shared/api/LoginRequest";
import { requestAccount } from "./requestAccount";

export async function requestLogin(login: LoginRequest): Promise<GuestResponse> {
  return requestAccount("/api/logins", login);
}
