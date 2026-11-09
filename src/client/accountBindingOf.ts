import type { AccountBinding } from "./screens/account/AccountBinding";
import type { ClientStore } from "./store/ClientStore";
import type { StoredSession } from "./store/StoredSession";

export function accountBindingOf(store: ClientStore, session: StoredSession): AccountBinding {
  return {
    name: session.name,
    isGuest: session.isGuest,
    onSignUp: store.signUp,
    onChangeUsername: store.changeUsername,
    onLoadAccount: store.loadAccount,
    onLogOut: store.logOut,
  };
}
