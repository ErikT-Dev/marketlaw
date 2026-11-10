import type { AccountBinding } from "./screens/account/AccountBinding";
import type { ClientStore } from "./store/ClientStore";
import type { StoredSession } from "./store/StoredSession";

export function accountBindingOf(
  store: ClientStore,
  session: StoredSession,
  isInGame: boolean,
): AccountBinding {
  return {
    name: session.name,
    isGuest: session.isGuest,
    isInGame,
    onSignUp: store.signUp,
    onChangeUsername: store.changeUsername,
    onLoadAccount: store.loadAccount,
    onChangeEmail: store.changeEmail,
    onSendConfirmationAgain: store.sendConfirmationAgain,
    onDeleteAccount: store.deleteAccount,
    onLogOut: store.logOut,
  };
}
