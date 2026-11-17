import { useState } from "react";
import type { CardName } from "../../../shared/catalogue/CardName";
import { CARDS } from "../../../shared/catalogue/CARDS";
import { Button } from "../../components/Button";
import { goBack } from "../../components/goBack";
import { useOverlayPage } from "../../components/useOverlayPage";
import { ClockKeepsRunningNote } from "../game/ClockKeepsRunningNote";
import type { RunningGameClock } from "../game/RunningGameClock";
import { ANY_CARD } from "./ANY_CARD";
import { CardDetailDialog } from "./CardDetailDialog";
import { cardMatchCountText } from "./cardMatchCountText";
import { CardSetFilters } from "./CardSetFilters";
import { CardSetGrid } from "./CardSetGrid";
import { cardsMatching } from "./cardsMatching";
import styles from "./CardSet.module.css";

type Props = {
  readonly openCard: CardName | null;
  readonly gameClock: RunningGameClock | null;
};

export function CardSetPage({ openCard, gameClock }: Props) {
  const pageRef = useOverlayPage();
  const [filter, setFilter] = useState(ANY_CARD);
  const cards = cardsMatching(CARDS, filter);
  return (
    <div
      ref={pageRef}
      tabIndex={-1}
      className={`${styles["page"] ?? ""} ${gameClock === null ? "" : (styles["belowTopBar"] ?? "")}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-set-title"
    >
      <div className={styles["panel"]} inert={openCard !== null}>
        <div className={styles["controls"]}>
          <header className={styles["header"]}>
            <h1 id="card-set-title" className={styles["title"]}>
              Card set
            </h1>
            <input
              className={styles["search"]}
              type="search"
              aria-label="Search by card name"
              placeholder="Search by card name"
              value={filter.nameText}
              onChange={(event) => {
                setFilter({ ...filter, nameText: event.target.value });
              }}
            />
            <Button look="secondary" onClick={goBack}>
              Back
            </Button>
          </header>
          {gameClock === null ? null : (
            <ClockKeepsRunningNote
              text="Your clock keeps running while the card set is open."
              gameClock={gameClock}
            />
          )}
          <CardSetFilters filter={filter} onChange={setFilter} />
          <p className={styles["count"]}>
            <span role="status">{cardMatchCountText(cards.length)}</span> · click a card to see
            everything about it
          </p>
        </div>
        <CardSetGrid cards={cards} />
      </div>
      {openCard === null ? null : <CardDetailDialog name={openCard} />}
    </div>
  );
}
