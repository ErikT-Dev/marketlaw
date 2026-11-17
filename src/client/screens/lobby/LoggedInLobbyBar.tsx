import { Button } from "../../components/Button";
import type { AccountBinding } from "../account/AccountBinding";
import { UserAccount } from "../account/UserAccount";
import { matchHistoryOpenerOf } from "../records/matchHistoryOpenerOf";
import { RankingButton } from "./RankingButton";
import styles from "./Lobby.module.css";

type Props = {
  readonly account: AccountBinding;
  readonly rating: number | null;
};

export function LoggedInLobbyBar({ account, rating }: Props) {
  const openMatchHistory = matchHistoryOpenerOf(account.playerId);
  return (
    <div className={styles["accountButtons"]}>
      <Button
        look="menu"
        {...(openMatchHistory === null ? { isDisabled: true } : { onClick: openMatchHistory })}
      >
        My match history
      </Button>
      <RankingButton />
      <UserAccount account={account} rating={rating} />
    </div>
  );
}
