import { cardTilePictureUrl } from "../icons/cardTilePictureUrl";
import styles from "./CardTilePicture.module.css";

type Props = {
  readonly photo: string;
};

export function CardTilePicture({ photo }: Props) {
  return (
    <span className={styles["line"]} aria-hidden="true">
      <span className={styles["picture"]}>
        <img src={cardTilePictureUrl(photo)} alt="" loading="lazy" decoding="async" />
      </span>
    </span>
  );
}
