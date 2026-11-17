import { Button } from "../../components/Button";
import { goBack } from "../../components/goBack";
import { useOverlayPage } from "../../components/useOverlayPage";
import { ClockKeepsRunningNote } from "../game/ClockKeepsRunningNote";
import type { RunningGameClock } from "../game/RunningGameClock";
import { currentRulebookSection } from "./currentRulebookSection";
import { PARSED_RULEBOOK } from "./PARSED_RULEBOOK";
import { RulebookContents } from "./RulebookContents";
import { RulebookSectionView } from "./RulebookSectionView";
import type { RulesPageAddress } from "./RulesPageAddress";
import styles from "./Rules.module.css";

type Props = {
  readonly address: RulesPageAddress;
  readonly gameClock: RunningGameClock | null;
};

export function RulesPage({ address, gameClock }: Props) {
  const pageRef = useOverlayPage();
  const { section, isFirst, previous, next } = currentRulebookSection(
    PARSED_RULEBOOK,
    address.sectionAnchor,
  );
  return (
    <div
      ref={pageRef}
      tabIndex={-1}
      className={`${styles["page"] ?? ""} ${gameClock === null ? "" : (styles["belowTopBar"] ?? "")}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rules-title"
    >
      <div className={styles["viewer"]}>
        <header className={styles["header"]}>
          <h1 id="rules-title" className={styles["title"]}>
            Rules
          </h1>
          <Button look="secondary" onClick={goBack}>
            Back
          </Button>
        </header>
        {gameClock === null ? null : (
          <ClockKeepsRunningNote
            text="Your clock keeps running while the rules are open."
            gameClock={gameClock}
          />
        )}
        <div className={styles["body"]}>
          <RulebookContents contents={PARSED_RULEBOOK.contents} currentAnchor={section.anchor} />
          <RulebookSectionView
            key={section.anchor}
            section={section}
            introduction={isFirst ? PARSED_RULEBOOK.introduction : []}
            previous={previous}
            next={next}
          />
        </div>
      </div>
    </div>
  );
}
