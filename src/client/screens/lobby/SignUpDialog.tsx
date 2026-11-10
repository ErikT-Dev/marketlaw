import { useState } from "react";
import type { SignupRequest } from "../../../shared/api/SignupRequest";
import type { ReasonCode } from "../../../shared/ReasonCode";
import type { IconText } from "../../components/IconText";
import { Modal } from "../../components/Modal";
import { TextWithIcons } from "../../components/TextWithIcons";
import { PrivacyNoticeLink } from "../privacy/PrivacyNoticeLink";
import { DialogButtons } from "./DialogButtons";
import { HumanCheck } from "./HumanCheck";
import styles from "./Lobby.module.css";
import type { SignupField } from "./SignupField";
import { SignUpFields } from "./SignUpFields";
import { useSubmitWithHumanCheck } from "./useSubmitWithHumanCheck";

type Props = {
  readonly prefilledName: string;
  readonly isGuest: boolean;
  readonly onSubmit: (signup: Omit<SignupRequest, "token">) => Promise<ReasonCode | null>;
  readonly onCancel: () => void;
};

function fieldOf(problem: ReasonCode): SignupField {
  if (problem.startsWith("username_")) {
    return "username";
  }
  if (problem === "email_invalid") {
    return "email";
  }
  return problem === "password_invalid" ? "password" : "form";
}

export function SignUpDialog({ prefilledName, isGuest, onSubmit, onCancel }: Props) {
  const [username, setUsername] = useState(prefilledName);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { containerRef, humanCheckToken, isUnavailable, error, problem, isSending, submit } =
    useSubmitWithHumanCheck();
  function errorFor(field: SignupField): IconText | null {
    return problem !== null && fieldOf(problem) === field ? error : null;
  }
  const formError = errorFor("form");
  return (
    <Modal title="Sign up" size="large" onClose={onCancel}>
      <form
        noValidate
        className={styles["dialogBody"]}
        onSubmit={(event) => {
          event.preventDefault();
          const signup = { username: username.trim(), email: email.trim(), password };
          void submit(async (humanCheck) => onSubmit({ ...signup, humanCheck }));
        }}
      >
        <p>
          {isGuest
            ? "Signing up keeps everything you did as a guest, including a game in progress, and lets you log in from any browser."
            : "Signing up makes an account you can log in to from any browser."}
        </p>
        <SignUpFields
          {...{ username, email, password, errorFor }}
          onUsernameChange={setUsername}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
        />
        <PrivacyNoticeLink />
        <HumanCheck containerRef={containerRef} isUnavailable={isUnavailable} />
        {formError === null ? null : (
          <p role="alert" className={styles["error"]}>
            <TextWithIcons text={formError} />
          </p>
        )}
        <DialogButtons
          submitLabel="Sign up"
          sendingLabel={isSending ? "Signing up" : null}
          isDisabled={humanCheckToken === ""}
          onCancel={onCancel}
        />
      </form>
    </Modal>
  );
}
