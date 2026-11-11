import { useId } from "react";
import type { Sector } from "../../../shared/catalogue/Sector";
import { listedNames } from "./listedNames";
import type { MarketGoState } from "./MarketGoState";
import styles from "./MarketGoPanel.module.css";
import { SectorButtons } from "./SectorButtons";

type Props = {
  readonly state: MarketGoState;
  readonly isBusy: boolean;
  readonly onChooseSector: (sector: Sector) => void;
};

const TIME_OUT_TEXT =
  "If your time runs out, your go ends without a draw, and you choose a sector for your 2 cards later in your main phase.";

function titleOf(state: MarketGoState): string {
  switch (state.kind) {
    case "your_go":
      return state.isMarketplaceEmpty
        ? "The marketplace is empty"
        : "Your go: choose your turn draw";
    case "waiting":
      return `${state.goName}'s go`;
  }
}

function textsOf(state: MarketGoState): ReadonlyArray<string> {
  switch (state.kind) {
    case "your_go":
      return state.isMarketplaceEmpty
        ? [
            `Your turn draw is option B: choose a sector and draw 2 cards from the deck. ${TIME_OUT_TEXT}`,
          ]
        : [`Choose one of the two options. ${TIME_OUT_TEXT}`];
    case "waiting":
      return [
        `They are choosing their turn draw. Your go comes after ${listedNames(state.namesBefore)}, in player order.`,
        "On your go you take a card from the marketplace or draw 2 cards of one sector from the deck.",
      ];
  }
}

export function MarketGoPanel({ state, isBusy, onChooseSector }: Props) {
  const titleId = useId();
  const isYourGo = state.kind === "your_go";
  return (
    <section
      className={`${styles["panel"] ?? ""} ${isYourGo ? (styles["yourGo"] ?? "") : ""}`}
      aria-labelledby={titleId}
    >
      <h2 id={titleId} className={styles["title"]}>
        {titleOf(state)}
      </h2>
      {textsOf(state).map((text) => (
        <p key={text} className={styles["text"]}>
          {text}
        </p>
      ))}
      {state.kind === "your_go" && state.isMarketplaceEmpty ? (
        <SectorButtons isBusy={isBusy} onChoose={onChooseSector} />
      ) : null}
      {state.kind === "your_go" && !state.isMarketplaceEmpty ? (
        <div className={styles["options"]}>
          <div className={styles["option"]}>
            <h3 className={styles["optionTitle"]}>A · Take a free card</h3>
            <p className={styles["text"]}>
              Select a card in the marketplace, then press Draw under it. You also draw 1 card of
              the same sector from the deck.
            </p>
          </div>
          <div className={styles["option"]}>
            <h3 className={styles["optionTitle"]}>B · Draw 2 cards of one sector</h3>
            <p className={styles["text"]}>Choose the sector.</p>
            <SectorButtons isBusy={isBusy} onChoose={onChooseSector} />
          </div>
        </div>
      ) : null}
    </section>
  );
}
