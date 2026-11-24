import { useState } from "react";
import { FUNDS_PER_SOLD_CARD } from "../../../shared/FUNDS_PER_SOLD_CARD";
import { Button } from "../../components/Button";
import { StatChip } from "../../components/StatChip";
import styles from "./SelectedCardPanel.module.css";

type Props = {
  readonly canPlay: boolean;
  readonly canSell: boolean;
  readonly onPlay: () => void;
  readonly onSell: () => void;
  readonly onClose: () => void;
};

export function SelectedCardButtons({ canPlay, canSell, onPlay, onSell, onClose }: Props) {
  const [isAskingToSell, setIsAskingToSell] = useState(false);
  if (isAskingToSell) {
    return (
      <div className={styles["sellQuestion"]}>
        <p className={styles["question"]}>
          {"Sell for "}
          <StatChip stat="funds" value={FUNDS_PER_SOLD_CARD} />?
        </p>
        <div className={styles["buttons"]}>
          <Button
            look="secondary"
            onClick={() => {
              setIsAskingToSell(false);
            }}
          >
            Keep card
          </Button>
          <Button look="danger" isDisabled={!canSell} onClick={onSell}>
            Sell
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className={styles["buttons"]}>
      <Button look="secondary" onClick={onClose}>
        Close
      </Button>
      <Button
        look="secondary"
        isDisabled={!canSell}
        onClick={() => {
          setIsAskingToSell(true);
        }}
      >
        Sell
      </Button>
      <Button look="menu" isDisabled={!canPlay} onClick={onPlay}>
        Play card
      </Button>
    </div>
  );
}
