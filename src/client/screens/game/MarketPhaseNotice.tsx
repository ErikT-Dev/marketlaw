import { Panel } from "../../components/Panel";
import styles from "./ActionsPanel.module.css";

export function MarketPhaseNotice() {
  return (
    <Panel title="Actions">
      <p className={styles["info"]}>
        Market phase: play, sell and the other main-phase actions open when your market go ends.
        Quests cannot be completed before then.
      </p>
    </Panel>
  );
}
