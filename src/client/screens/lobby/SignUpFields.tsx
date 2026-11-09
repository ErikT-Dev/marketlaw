import type { IconText } from "../../components/IconText";
import { TextInput } from "../../components/TextInput";
import type { SignupField } from "./SignupField";

type Props = {
  readonly username: string;
  readonly email: string;
  readonly password: string;
  readonly onUsernameChange: (username: string) => void;
  readonly onEmailChange: (email: string) => void;
  readonly onPasswordChange: (password: string) => void;
  readonly errorFor: (field: SignupField) => IconText | null;
};

export function SignUpFields(props: Props) {
  const { username, email, password, errorFor } = props;
  return (
    <>
      <TextInput
        label="Username"
        value={username}
        maxLength={20}
        autoComplete="username"
        onChange={props.onUsernameChange}
        hint="Keep it or change it. A change here does not count toward the 7-day limit."
        error={errorFor("username")}
      />
      <TextInput
        label="Email address"
        type="email"
        value={email}
        maxLength={254}
        autoComplete="email"
        onChange={props.onEmailChange}
        hint="Only used to confirm it and for password resets. Never shown to other players."
        error={errorFor("email")}
      />
      <TextInput
        label="Password"
        type="password"
        value={password}
        autoComplete="new-password"
        onChange={props.onPasswordChange}
        hint="8 to 64 characters"
        error={errorFor("password")}
      />
    </>
  );
}
