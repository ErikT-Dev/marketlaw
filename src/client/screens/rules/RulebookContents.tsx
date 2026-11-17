import type { RulebookSectionRef } from "./RulebookSectionRef";
import styles from "./Rules.module.css";
import { SectionLink } from "./SectionLink";

type Props = {
  readonly contents: ReadonlyArray<RulebookSectionRef>;
  readonly currentAnchor: string;
};

export function RulebookContents({ contents, currentAnchor }: Props) {
  return (
    <nav className={styles["contents"]} aria-labelledby="rules-contents-title">
      <h2 id="rules-contents-title" className={styles["contentsTitle"]}>
        Contents
      </h2>
      <ol className={styles["contentsList"]}>
        {contents.map((entry) => (
          <li key={entry.anchor}>
            <SectionLink
              anchor={entry.anchor}
              className={styles["contentsLink"]}
              isCurrent={entry.anchor === currentAnchor}
            >
              {entry.title}
            </SectionLink>
          </li>
        ))}
      </ol>
    </nav>
  );
}
