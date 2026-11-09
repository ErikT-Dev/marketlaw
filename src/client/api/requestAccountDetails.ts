import * as v from "valibot";
import { AccountResponse } from "../../shared/api/AccountResponse";
import { postJson } from "./postJson";

export async function requestAccountDetails(token: string): Promise<AccountResponse | null> {
  const parsed = v.safeParse(
    AccountResponse,
    await postJson("/api/account", { token }).catch(() => null),
  );
  return parsed.success ? parsed.output : null;
}
