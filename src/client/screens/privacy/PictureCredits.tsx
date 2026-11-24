import { PLAYER_ICON_ARTISTS } from "../../icons/PLAYER_ICON_ARTISTS";
import styles from "./PrivacyNotice.module.css";

export function PictureCredits() {
  return (
    <section aria-labelledby="privacy-credits" className={styles["part"]}>
      <h2 id="privacy-credits">Picture credits</h2>
      <p>
        The player icon pictures are by these artists of game-icons.net, under the Creative Commons
        Attribution 3.0 licence:
      </p>
      <ul aria-label="Artists">
        {PLAYER_ICON_ARTISTS.map(({ folder, name }) => (
          <li key={folder}>{name}</li>
        ))}
      </ul>
    </section>
  );
}
