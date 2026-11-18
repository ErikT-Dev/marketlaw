import type { EmailChangeRequest } from "../../shared/api/EmailChangeRequest";
import type { NewPasswordRequest } from "../../shared/api/NewPasswordRequest";
import type { ResetEmailRequest } from "../../shared/api/ResetEmailRequest";
import type { ReasonCode } from "../../shared/ReasonCode";
import { requestAccount } from "../api/requestAccount";
import { requestEmailAction } from "../api/requestEmailAction";
import { AccountSessionStore } from "./AccountSessionStore";
import type { EmailDialog } from "./EmailDialog";
import type { EmailLink } from "./EmailLink";

export abstract class EmailAccountStore extends AccountSessionStore {
  readonly openEmailLink = async (link: EmailLink): Promise<void> => {
    switch (link.kind) {
      case "confirm":
        await this.confirmEmail(link.link);
        return;
      case "reset":
        this.showEmailDialog({ kind: "new_password", link: link.link });
        return;
      case "forgot_password":
        this.showEmailDialog({ kind: "forgot_password" });
        return;
    }
  };

  readonly openForgotPassword = (): void => {
    this.showEmailDialog({ kind: "forgot_password" });
  };

  readonly closeEmailDialog = (): void => {
    this.showEmailDialog(null);
  };

  readonly sendConfirmationAgain = async (): Promise<ReasonCode | null> => {
    const session = this.state.session;
    if (session === null) {
      return "invalid_token";
    }
    return requestEmailAction("/api/confirmation-emails", { token: session.token });
  };

  readonly sendConfirmationAfterExpiredLink = async (
    address: string,
  ): Promise<ReasonCode | null> => {
    const problem = await this.sendConfirmationAgain();
    if (problem === null) {
      this.showEmailDialog({ kind: "check_email", address });
    }
    return problem;
  };

  readonly changeEmail = async (
    change: Omit<EmailChangeRequest, "token">,
  ): Promise<ReasonCode | null> => {
    const session = this.state.session;
    if (session === null) {
      return "invalid_token";
    }
    return requestEmailAction("/api/email-changes", { ...change, token: session.token });
  };

  readonly deleteAccount = async (password: string): Promise<ReasonCode | null> => {
    const session = this.state.session;
    if (session === null) {
      return "invalid_token";
    }
    const problem = await requestEmailAction("/api/account-deletions", {
      token: session.token,
      password,
    });
    if (problem === null && this.state.session?.token === session.token) {
      this.leaveRoom(null, null);
    }
    return problem;
  };

  readonly requestPasswordReset = async (request: ResetEmailRequest): Promise<ReasonCode | null> =>
    requestEmailAction("/api/reset-emails", request);

  readonly setNewPassword = async (request: NewPasswordRequest): Promise<ReasonCode | null> => {
    const answer = await requestAccount("/api/password-resets", request);
    if (!answer.isOk) {
      if (answer.reason === "link_expired") {
        await this.showExpiredLink();
      }
      return answer.reason;
    }
    this.leaveRoom(null, {
      token: answer.token,
      playerId: answer.playerId,
      name: answer.name,
      isGuest: false,
      roomCode: null,
      isInTutorial: false,
    });
    this.showEmailDialog(null);
    return null;
  };

  private async confirmEmail(link: string): Promise<void> {
    const problem = await requestEmailAction("/api/email-confirmations", { link });
    if (problem === null) {
      this.showEmailDialog({ kind: "email_confirmed" });
    } else if (problem === "link_expired") {
      await this.showExpiredLink();
    } else {
      this.change({ notice: "The email link could not be opened. Open it from the email again." });
    }
  }

  private async showExpiredLink(): Promise<void> {
    const account = await this.loadAccount();
    const email = account?.isLoggedIn === true ? account.email : null;
    const unconfirmedAddress = email === null || email.isConfirmed ? null : email.address;
    this.showEmailDialog({ kind: "link_expired", unconfirmedAddress });
  }

  private showEmailDialog(emailDialog: EmailDialog | null): void {
    this.change({ emailDialog });
  }
}
