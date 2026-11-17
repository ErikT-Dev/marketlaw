import { Button } from "../../components/Button";
import styles from "./Lobby.module.css";
import { RankingButton } from "./RankingButton";

type Props = {
  readonly onLogIn: () => void;
  readonly onSignUp: () => void;
};

export function AccountButtons({ onLogIn, onSignUp }: Props) {
  return (
    <div className={styles["accountButtons"]}>
      <RankingButton />
      <Button look="menu" onClick={onLogIn}>
        Log in
      </Button>
      <Button look="primary" onClick={onSignUp}>
        Sign up
      </Button>
    </div>
  );
}
