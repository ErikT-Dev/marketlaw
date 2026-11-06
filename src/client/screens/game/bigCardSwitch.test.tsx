import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { cardOf } from "../../../shared/catalogue/cardOf";
import type { CardName } from "../../../shared/catalogue/CardName";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import { CARD_TEXTURE_URL } from "../../icons/CARD_TEXTURE_URL";
import { photoUrl } from "../../icons/photoUrl";
import { gamePageProps } from "../../testing/gamePageProps";
import { photoLoaderThatDecodes } from "../../testing/photoLoaderThatDecodes";
import { roomUpdateWith } from "../../testing/roomUpdateWith";
import { GamePage } from "../GamePage";
import { PhotoLoading } from "./PhotoLoading";

const HAND: Partial<OwnSeatView> = {
  hand: ["Farm House", "Log House"],
  handDetails: [
    { card: "Farm House", realCost: 6, sameSectorAndTierInCity: 2, playRejection: null },
    { card: "Log House", realCost: 5, sameSectorAndTierInCity: 0, playRejection: null },
  ],
};
const NEVER_LOADING: CardName = "Log House";

async function showGameWhere(isDecoded: (url: string) => boolean) {
  const loader = photoLoaderThatDecodes(isDecoded);
  const props = gamePageProps(roomUpdateWith({}, HAND));
  render(
    <PhotoLoading value={loader}>
      <GamePage {...props} />
    </PhotoLoading>,
  );
  await act(async () => Promise.resolve());
  return { ...props, loader };
}

function handCard(name: string) {
  return within(screen.getByRole("list", { name: "Your hand" })).getByRole("button", { name });
}

function selectedCard() {
  return screen.getByRole("region", { name: /^Selected card: / });
}

describe("switching the big card", () => {
  it("decodes the card background and the photo of every hand card once the game is shown", async () => {
    const { loader } = await showGameWhere(() => true);
    expect(loader.decode.mock.calls.map(([url]) => url)).toEqual([
      CARD_TEXTURE_URL,
      photoUrl(cardOf("Farm House").photo),
      photoUrl(cardOf("Log House").photo),
    ]);
  });

  it("decodes the photo of a card that joins the hand", async () => {
    const loader = photoLoaderThatDecodes(() => true);
    const props = gamePageProps(roomUpdateWith({}, HAND));
    const { rerender } = render(
      <PhotoLoading value={loader}>
        <GamePage {...props} />
      </PhotoLoading>,
    );
    const joined = gamePageProps(
      roomUpdateWith(
        {},
        {
          hand: [...(HAND.hand ?? []), "Loft"],
          handDetails: [
            ...(HAND.handDetails ?? []),
            { card: "Loft", realCost: 8, sameSectorAndTierInCity: 0, playRejection: null },
          ],
        },
      ),
    );
    rerender(
      <PhotoLoading value={loader}>
        <GamePage {...joined} />
      </PhotoLoading>,
    );
    await act(async () => Promise.resolve());
    expect(loader.decode.mock.calls.map(([url]) => url)).toContain(photoUrl(cardOf("Loft").photo));
    expect(loader.decode).toHaveBeenCalledTimes(4);
  });

  it("shows a card at once when its photo is ready", async () => {
    await showGameWhere(() => true);
    fireEvent.click(handCard("Log House"));
    expect(selectedCard().getAttribute("aria-label")).toBe("Selected card: Log House");
    expect(handCard("Log House").getAttribute("aria-pressed")).toBe("true");
  });

  it("keeps the card shown before, and plays it, until the new photo is ready", async () => {
    const neverLoadingUrl = photoUrl(cardOf(NEVER_LOADING).photo);
    const { onAction } = await showGameWhere((url) => url !== neverLoadingUrl);
    fireEvent.click(handCard("Farm House"));
    fireEvent.click(handCard("Log House"));
    expect(selectedCard().getAttribute("aria-label")).toBe("Selected card: Farm House");
    expect(handCard("Farm House").getAttribute("aria-pressed")).toBe("true");
    expect(handCard("Log House").getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(within(selectedCard()).getByRole("button", { name: "Play card" }));
    expect(onAction).toHaveBeenCalledWith({ type: "play_card", card: "Farm House" });
  });

  it("shows the card after 300 ms with its sector colour where a photo that never loads goes", async () => {
    const neverLoadingUrl = photoUrl(cardOf(NEVER_LOADING).photo);
    const { loader } = await showGameWhere((url) => url !== neverLoadingUrl);
    fireEvent.click(handCard("Log House"));
    expect(screen.queryByRole("region", { name: /^Selected card: / })).toBeNull();
    const [milliseconds, finishWaiting] = loader.wait.mock.calls[0] ?? [];
    expect(milliseconds).toBe(300);
    act(() => {
      finishWaiting?.();
    });
    const photo = within(selectedCard())
      .getAllByRole("presentation")
      .find((image) => image.getAttribute("src") === neverLoadingUrl);
    expect(selectedCard().getAttribute("aria-label")).toBe("Selected card: Log House");
    expect(photo?.style.background).toBe("var(--color-sector-residential-solid)");
  });

  it("closes the card at once when the selected card is pressed again", async () => {
    await showGameWhere(() => true);
    fireEvent.click(handCard("Log House"));
    fireEvent.click(handCard("Log House"));
    expect(screen.queryByRole("region", { name: /^Selected card: / })).toBeNull();
  });
});
