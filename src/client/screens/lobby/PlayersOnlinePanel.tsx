import type { PlayerOnlineView } from "../../../shared/protocol/PlayerOnlineView";
import { PlayerBadge } from "../../components/PlayerBadge";
import lobbyStyles from "./Lobby.module.css";
import { onlineBadgeStatusOf } from "./onlineBadgeStatusOf";
import styles from "./PlayersOnline.module.css";

type Props = {
  readonly players: ReadonlyArray<PlayerOnlineView>;
};

export function PlayersOnlinePanel({ players }: Props) {
  return (
    <section className={lobbyStyles["panel"]} aria-labelledby="players-online-heading">
      <h2 id="players-online-heading" className={lobbyStyles["panelTitle"]}>
        Players online · {players.length}
      </h2>
      <ul className={styles["list"]} aria-label="Players online">
        {players.map((player) => (
          <li key={player.playerId} className={styles["row"]}>
            <PlayerBadge
              name={player.username}
              playerId={player.playerId}
              status={onlineBadgeStatusOf(player.status)}
              {...(player.rating === null ? {} : { rating: player.rating })}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
