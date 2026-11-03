import * as v from "valibot";
import { TURNSTILE_API, type TurnstileApi } from "./TURNSTILE_API";

const SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

let loading: Promise<TurnstileApi | null> | null = null;

function loadedApi(): TurnstileApi | null {
  const parsed = v.safeParse(TURNSTILE_API, Reflect.get(window, "turnstile"));
  return parsed.success ? parsed.output : null;
}

export async function loadTurnstile(): Promise<TurnstileApi | null> {
  loading ??= new Promise((resolve) => {
    const script = document.createElement("script");
    script.setAttribute("src", SCRIPT_URL);
    script.setAttribute("async", "");
    script.addEventListener("load", () => {
      resolve(loadedApi());
    });
    script.addEventListener("error", () => {
      loading = null;
      resolve(null);
    });
    document.head.append(script);
  });
  return loadedApi() ?? loading;
}
