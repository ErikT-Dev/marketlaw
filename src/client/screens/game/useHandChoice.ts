import { useContext, useEffect, useState } from "react";
import type { CardName } from "../../../shared/catalogue/CardName";
import type { HandChoice } from "./HandChoice";
import type { HandSwitch } from "./HandSwitch";
import { PhotoLoading } from "./PhotoLoading";
import { useReadyPhotos } from "./useReadyPhotos";

const NOTHING_CHOSEN: HandChoice = { mode: "choosing", selected: null };
const NOTHING_SWITCHING: HandSwitch = {
  shown: NOTHING_CHOSEN,
  wanted: null,
  hasWaitedLongEnough: false,
};
const LONGEST_PHOTO_WAIT_MS = 300;

function pressed(choice: HandChoice, card: CardName): HandChoice {
  if (choice.mode === "choosing") {
    return { mode: "choosing", selected: choice.selected === card ? null : card };
  }
  const isMarked = choice.marked.includes(card);
  return {
    mode: "selling",
    marked: isMarked ? choice.marked.filter((marked) => marked !== card) : [...choice.marked, card],
  };
}

function stillInHand(choice: HandChoice, hand: ReadonlyArray<CardName>): HandChoice {
  if (choice.mode === "selling") {
    return { mode: "selling", marked: choice.marked.filter((card) => hand.includes(card)) };
  }
  const isSelectedInHand = choice.selected !== null && hand.includes(choice.selected);
  return isSelectedInHand ? choice : NOTHING_CHOSEN;
}

function settled(handSwitch: HandSwitch, ready: ReadonlyArray<CardName>): HandChoice {
  const { shown, wanted } = handSwitch;
  const canShowWanted =
    wanted !== null && (handSwitch.hasWaitedLongEnough || ready.includes(wanted));
  return canShowWanted ? { mode: "choosing", selected: wanted } : shown;
}

function switchedTo(next: HandChoice, from: HandChoice, ready: ReadonlyArray<CardName>) {
  const isWaitingForPhoto =
    next.mode === "choosing" && next.selected !== null && !ready.includes(next.selected);
  return isWaitingForPhoto
    ? { shown: from, wanted: next.selected, hasWaitedLongEnough: false }
    : { shown: next, wanted: null, hasWaitedLongEnough: false };
}

export function useHandChoice(hand: ReadonlyArray<CardName>) {
  const loader = useContext(PhotoLoading);
  const ready = useReadyPhotos(hand);
  const [handSwitch, setHandSwitch] = useState<HandSwitch>(NOTHING_SWITCHING);
  const { wanted } = handSwitch;
  useEffect(() => {
    if (wanted === null) {
      return undefined;
    }
    return loader.wait(LONGEST_PHOTO_WAIT_MS, () => {
      setHandSwitch((current) =>
        current.wanted === wanted ? { ...current, hasWaitedLongEnough: true } : current,
      );
    });
  }, [loader, wanted]);
  return {
    choice: stillInHand(settled(handSwitch, ready), hand),
    pressCard: (card: CardName) => {
      setHandSwitch((current) => {
        const from = stillInHand(settled(current, ready), hand);
        return switchedTo(pressed(from, card), from, ready);
      });
    },
    startSelling: () => {
      setHandSwitch({ ...NOTHING_SWITCHING, shown: { mode: "selling", marked: [] } });
    },
    clear: () => {
      setHandSwitch(NOTHING_SWITCHING);
    },
  };
}
