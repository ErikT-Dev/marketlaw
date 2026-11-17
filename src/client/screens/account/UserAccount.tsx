import { useState } from "react";
import { SignUpDialog } from "../lobby/SignUpDialog";
import { AccountChangeDialog } from "./AccountChangeDialog";
import type { AccountBinding } from "./AccountBinding";
import { AccountSettingsDialog } from "./AccountSettingsDialog";
import { GuestLogOutWarning } from "./GuestLogOutWarning";
import type { UserAccountDialog } from "./UserAccountDialog";
import { UserMenu } from "./UserMenu";
import { matchHistoryOpenerOf } from "../records/matchHistoryOpenerOf";

type Props = {
  readonly account: AccountBinding;
  readonly rating: number | null;
};

export function UserAccount({ account, rating }: Props) {
  const [dialog, setDialog] = useState<UserAccountDialog | null>(null);
  function close() {
    setDialog(null);
  }
  function openSignUp() {
    setDialog("sign_up");
  }
  function openSettings() {
    setDialog("settings");
  }
  function logOut() {
    if (account.isGuest) {
      setDialog("guest_log_out_warning");
    } else {
      void account.onLogOut();
    }
  }
  return (
    <>
      <UserMenu
        name={account.name}
        isGuest={account.isGuest}
        rating={rating}
        onSignUp={openSignUp}
        onOpenSettings={openSettings}
        onOpenMatchHistory={matchHistoryOpenerOf(account.playerId)}
        onLogOut={logOut}
      />
      {dialog === "settings" ? (
        <AccountSettingsDialog
          account={account}
          onSignUp={openSignUp}
          onOpenDialog={setDialog}
          onLogOut={logOut}
          onClose={close}
        />
      ) : null}
      <AccountChangeDialog dialog={dialog} account={account} onBack={openSettings} />
      {dialog === "guest_log_out_warning" ? (
        <GuestLogOutWarning onSignUp={openSignUp} onLogOut={account.onLogOut} onCancel={close} />
      ) : null}
      {dialog === "sign_up" ? (
        <SignUpDialog
          prefilledName={account.name}
          isGuest={account.isGuest}
          onSubmit={async (signup) => {
            const problem = await account.onSignUp(signup);
            if (problem === null) {
              close();
            }
            return problem;
          }}
          onCancel={close}
        />
      ) : null}
    </>
  );
}
