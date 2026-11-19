import type { CardName } from "../../../shared/catalogue/CardName";
import type { TypeName } from "../../../shared/catalogue/TypeName";
import type { OtherSeatView } from "../../../shared/OtherSeatView";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerId } from "../../../shared/PlayerId";
import { LookedAtCardPanel } from "./LookedAtCardPanel";
import styles from "./OpponentBoardDialog.module.css";
import { OpponentStatsBox } from "./OpponentStatsBox";

type Props = {
  readonly seat: OtherSeatView;
  readonly ownSeat: OwnSeatView | undefined;
  readonly name: string;
  readonly playerId: PlayerId | null;
  readonly bonusTypes: ReadonlyArray<TypeName>;
  readonly lookedAt: CardName | null;
  readonly onCloseCard: () => void;
};

export function OpponentStatsOrLookedAtCard(props: Props) {
  const { seat, name, playerId, bonusTypes, lookedAt } = props;
  if (lookedAt === null) {
    return <OpponentStatsBox seat={seat} name={name} playerId={playerId} bonusTypes={bonusTypes} />;
  }
  return (
    <LookedAtCardPanel
      card={lookedAt}
      comboMarksAgainst={props.ownSeat}
      className={styles["bigCard"]}
      onClose={props.onCloseCard}
    />
  );
}
