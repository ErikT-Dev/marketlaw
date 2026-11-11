import type { PlayerId } from "../../shared/PlayerId";
import { UsernameLink } from "./UsernameLink";

type Props = {
  readonly name: string;
  readonly playerId: PlayerId | null;
};

export function PlayerNameLink({ name, playerId }: Props) {
  return playerId === null ? name : <UsernameLink playerId={playerId} username={name} />;
}
