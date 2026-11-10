import { TextInput } from "../../components/TextInput";
import { DialogButtons } from "../lobby/DialogButtons";
import { HumanCheck } from "../lobby/HumanCheck";
import type { SubmitWithHumanCheck } from "../lobby/SubmitWithHumanCheck";

type Props = {
  readonly label: string;
  readonly email: string;
  readonly onChangeEmail: (email: string) => void;
  readonly check: SubmitWithHumanCheck;
  readonly onCancel: () => void;
};

export function EmailLinkFields({ label, email, onChangeEmail, check, onCancel }: Props) {
  return (
    <>
      <TextInput
        label={label}
        type="email"
        value={email}
        maxLength={254}
        autoComplete="email"
        onChange={onChangeEmail}
        error={check.error}
      />
      <HumanCheck containerRef={check.containerRef} isUnavailable={check.isUnavailable} />
      <DialogButtons
        submitLabel="Send link"
        sendingLabel={check.isSending ? "Sending" : null}
        isDisabled={check.humanCheckToken === "" || email.trim() === ""}
        onCancel={onCancel}
      />
    </>
  );
}
