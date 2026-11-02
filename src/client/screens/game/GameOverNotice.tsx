import { Button } from "../../components/Button";
import { Panel } from "../../components/Panel";
import styles from "./ActionsPanel.module.css";

type Props = {
  readonly onShowResult: () => void;
};

export function GameOverNotice({ onShowResult }: Props) {
  return (
    <Panel title="Actions">
      <p className={styles["info"]}>The game is over.</p>
      <Button look="primary" onClick={onShowResult}>
        Show result
      </Button>
    </Panel>
  );
}
