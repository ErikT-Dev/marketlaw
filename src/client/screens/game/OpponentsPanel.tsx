import { playerIdOf } from "./playerIdOf";
import type { PlayerId } from "../../../shared/PlayerId";
import { useState } from "react";
import type { PlayerView } from "../../../shared/PlayerView";
import type { SeatNumber } from "../../../shared/SeatNumber";
import { Panel } from "../../components/Panel";
import { OpponentBoardDialog } from "./OpponentBoardDialog";
import { OpponentCard } from "./OpponentCard";
import styles from "./OpponentCard.module.css";
import { playerNameOf } from "./playerNameOf";

type Props = {
  readonly view: PlayerView;
  readonly playerNames: ReadonlyArray<string>;
  readonly playerIds: ReadonlyArray<PlayerId>;
};

export function OpponentsPanel({ view, playerNames, playerIds }: Props) {
  const [openSeat, setOpenSeat] = useState<SeatNumber | null>(null);
  const others = view.seats.flatMap((seat) => (seat.kind === "other" ? [seat] : []));
  const opened = others.find((seat) => seat.seat === openSeat);
  return (
    <Panel title="Opponents">
      <ul className={styles["list"]}>
        {others.map((seat) => (
          <OpponentCard
            key={seat.seat}
            seat={seat}
            name={playerNameOf(playerNames, seat.seat)}
            playerId={playerIdOf(playerIds, seat.seat)}
            onOpen={() => {
              setOpenSeat(seat.seat);
            }}
          />
        ))}
      </ul>
      {opened === undefined ? null : (
        <OpponentBoardDialog
          seat={opened}
          name={playerNameOf(playerNames, opened.seat)}
          playerId={playerIdOf(playerIds, opened.seat)}
          phase={view.phase}
          onClose={() => {
            setOpenSeat(null);
          }}
        />
      )}
    </Panel>
  );
}
