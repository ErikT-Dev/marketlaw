import { useContext, useEffect, useRef, useState } from "react";
import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";
import { CARD_TEXTURE_URL } from "../../icons/CARD_TEXTURE_URL";
import { photoUrl } from "../../icons/photoUrl";
import { PhotoLoading } from "./PhotoLoading";
import type { RequestedPhoto } from "./RequestedPhoto";

export function useReadyPhotos(hand: ReadonlyArray<CardName>): ReadonlyArray<CardName> {
  const loader = useContext(PhotoLoading);
  const cardTexture = useRef<Promise<unknown> | null>(null);
  const requested = useRef<ReadonlyArray<RequestedPhoto>>([]);
  const [ready, setReady] = useState<ReadonlyArray<CardName>>([]);
  useEffect(() => {
    cardTexture.current ??= loader.decode(CARD_TEXTURE_URL).catch(() => undefined);
    const known = requested.current.map(({ card }) => card);
    const newCards = [...new Set(hand)].filter((card) => !known.includes(card));
    const added = newCards.map((card) => ({
      card,
      decoding: loader.decode(photoUrl(cardOf(card).photo)),
    }));
    requested.current = [...requested.current, ...added];
    for (const { card, decoding } of added) {
      decoding.then(
        () => {
          setReady((cards) => [...cards, card]);
        },
        () => undefined,
      );
    }
  }, [loader, hand]);
  return ready;
}
