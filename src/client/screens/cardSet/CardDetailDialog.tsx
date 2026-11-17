import type { CardName } from "../../../shared/catalogue/CardName";
import { cardOf } from "../../../shared/catalogue/cardOf";
import { BigCard } from "../../components/BigCard";
import { Button } from "../../components/Button";
import { goBack } from "../../components/goBack";
import { Modal } from "../../components/Modal";
import styles from "./CardDetail.module.css";
import { CardDetailFacts } from "./CardDetailFacts";
import { cardDetailOf } from "./cardDetailOf";
import { useFocusWhileOpen } from "./useFocusWhileOpen";

type Props = {
  readonly name: CardName;
};

export function CardDetailDialog({ name }: Props) {
  const focusRef = useFocusWhileOpen();
  const detail = cardDetailOf(cardOf(name));
  return (
    <Modal title={`#${String(detail.card.number)} ${name}`} size="extraLarge">
      <div ref={focusRef} tabIndex={-1} className={styles["body"]}>
        <BigCard card={detail.card} realCost={detail.card.baseCost} />
        <CardDetailFacts detail={detail} />
      </div>
      <div className={styles["buttons"]}>
        <Button look="secondary" onClick={goBack}>
          Close
        </Button>
      </div>
    </Modal>
  );
}
