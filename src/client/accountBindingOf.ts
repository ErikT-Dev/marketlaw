import type { AccountBinding } from "./screens/account/AccountBinding";
import type { ClientStore } from "./store/ClientStore";
import type { StoredSession } from "./store/StoredSession";

export function accountBindingOf(
  store: ClientStore,
  session: StoredSession,
  isInGame: boolean,
): AccountBinding {
  const { accountIcon } = store.getSnapshot();
  return {
    playerId: session.playerId,
    name: session.name,
    isGuest: session.isGuest,
    icon: accountIcon?.token === session.token ? accountIcon.icon : null,
    isInGame,
    onSignUp: store.signUp,
    onChangeUsername: store.changeUsername,
    onChangeIcon: store.changeIcon,
    onLoadAccount: store.loadAccount,
    onChangeEmail: store.changeEmail,
    onSendConfirmationAgain: store.sendConfirmationAgain,
    onDeleteAccount: store.deleteAccount,
    onLogOut: store.logOut,
  };
}
