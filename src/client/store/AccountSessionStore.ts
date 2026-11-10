import type { AccountResponse } from "../../shared/api/AccountResponse";
import type { GuestResponse } from "../../shared/api/GuestResponse";
import type { LoginRequest } from "../../shared/api/LoginRequest";
import type { SignupRequest } from "../../shared/api/SignupRequest";
import type { ReasonCode } from "../../shared/ReasonCode";
import { requestAccountDetails } from "../api/requestAccountDetails";
import { requestGuest } from "../api/requestGuest";
import { requestLogin } from "../api/requestLogin";
import { requestLogout } from "../api/requestLogout";
import { requestSession } from "../api/requestSession";
import { requestSignup } from "../api/requestSignup";
import { requestUsernameChange } from "../api/requestUsernameChange";
import type { ClientState } from "./ClientState";
import { ObservableState } from "./ObservableState";
import type { StoredSession } from "./StoredSession";
import { writeSession } from "./writeSession";

export abstract class AccountSessionStore extends ObservableState<ClientState> {
  protected abstract leaveRoom(notice: string | null, session: StoredSession | null): void;

  protected async checkSession(session: StoredSession): Promise<void> {
    const answer = await requestSession(session.token);
    if (answer?.isLoggedIn === false && this.state.session?.token === session.token) {
      this.leaveRoom("Your login has ended. Choose a username to play again.", null);
    }
    if (answer?.isLoggedIn === true) {
      this.takeCheckedAccount(session, answer.name, answer.isGuest);
    }
  }

  private takeCheckedAccount(checked: StoredSession, name: string, isGuest: boolean): void {
    const current = this.state.session;
    const isUnchangedSinceCheck =
      current?.token === checked.token &&
      current.name === checked.name &&
      current.isGuest === checked.isGuest;
    if (isUnchangedSinceCheck && (current.name !== name || current.isGuest !== isGuest)) {
      const session = { ...current, name, isGuest };
      writeSession(session);
      this.change({ session });
    }
  }

  readonly startAsGuest = async (name: string, humanCheck: string): Promise<ReasonCode | null> =>
    this.startSession(await requestGuest(name, humanCheck), true);

  readonly logIn = async (login: LoginRequest): Promise<ReasonCode | null> =>
    this.startSession(await requestLogin(login), false);

  readonly signUp = async (signup: Omit<SignupRequest, "token">): Promise<ReasonCode | null> => {
    const guest = this.state.session?.isGuest === true ? this.state.session : null;
    const token = guest === null ? {} : { token: guest.token };
    const problem = this.startSession(await requestSignup({ ...signup, ...token }), false);
    if (problem === null) {
      this.change({ emailDialog: { kind: "check_email", address: signup.email } });
    }
    return problem;
  };

  readonly changeUsername = async (username: string): Promise<ReasonCode | null> => {
    const session = this.state.session;
    if (session === null) {
      return "invalid_token";
    }
    return this.startSession(
      await requestUsernameChange({ token: session.token, username }),
      session.isGuest,
    );
  };

  readonly loadAccount = async (): Promise<AccountResponse | null> => {
    const session = this.state.session;
    return session === null ? null : requestAccountDetails(session.token);
  };

  readonly logOut = async (): Promise<void> => {
    const session = this.state.session;
    if (session === null) {
      return;
    }
    if (!(await requestLogout(session.token))) {
      this.change({ notice: "Could not log out. Try again in a moment." });
      return;
    }
    const current = this.state.session;
    if (current === null || current.token === session.token) {
      this.leaveRoom(null, null);
    }
  };

  private startSession(answer: GuestResponse, isGuest: boolean): ReasonCode | null {
    if (!answer.isOk) {
      return answer.reason;
    }
    const current = this.state.session;
    const roomCode = current?.token === answer.token ? current.roomCode : null;
    const session = { token: answer.token, name: answer.name, isGuest, roomCode };
    writeSession(session);
    this.change({ session, notice: null });
    return null;
  }
}
