import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PrivacyNoticePage } from "./PrivacyNoticePage";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("privacy notice picture credits", () => {
  it("names every artist of the player icon pictures with the licence", () => {
    vi.stubGlobal("fetch", async () => Promise.resolve(Response.json({ address: "a@b.c" })));
    render(<PrivacyNoticePage />);
    const credits = screen.getByRole("region", { name: "Picture credits" });
    expect(credits.textContent).toContain("Creative Commons Attribution 3.0");
    const artists = within(within(credits).getByRole("list", { name: "Artists" }))
      .getAllByRole("listitem")
      .map((artist) => artist.textContent);
    expect(artists).toEqual([
      "Lorc",
      "Delapouite",
      "Carl Olsen",
      "Sbed",
      "Skoll",
      "Cathelineau",
      "Sparker",
      "DarkZaitzev",
      "Caro Asercion",
    ]);
  });
});
