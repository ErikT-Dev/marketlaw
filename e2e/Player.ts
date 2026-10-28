import type { Page } from "@playwright/test";

export type Player = { readonly page: Page; readonly frames: string[] };
