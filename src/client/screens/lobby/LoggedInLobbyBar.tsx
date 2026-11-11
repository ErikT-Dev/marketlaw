import { Button } from "../../components/Button";
import type { AccountBinding } from "../account/AccountBinding";
import { UserAccount } from "../account/UserAccount";
import { matchHistoryOpenerOf } from "../records/matchHistoryOpenerOf";
import styles from "./Lobby.module.css";

type Props = {
  readonly account: AccountBinding;
};

export function LoggedInLobbyBar({ account }: Props) {
  const openMatchHistory = matchHistoryOpenerOf(account.playerId);
  return (
    <div className={styles["accountButtons"]}>
      <Button
        look="menu"
        {...(openMatchHistory === null ? { isDisabled: true } : { onClick: openMatchHistory })}
      >
        My match history
      </Button>
      <UserAccount account={account} />
    </div>
  );
}
