import type { QuestReward } from "../../../shared/catalogue/QuestReward";
import { STAT_KEYS } from "../../../shared/STAT_KEYS";
import { STAT_ICONS } from "../../icons/STAT_ICONS";
import { typeIconFile } from "../../icons/typeIconFile";
import { counted } from "./counted";
import { QuestPart } from "./QuestPart";

type Props = {
  readonly reward: QuestReward;
};

export function QuestRewardParts({ reward }: Props) {
  const stats = STAT_KEYS.flatMap((stat) => {
    const amount = reward.stats[stat] ?? 0;
    return amount === 0 ? [] : [{ stat, amount }];
  });
  return (
    <>
      {reward.gainedType === null ? null : (
        <QuestPart
          amount="+1"
          label={reward.gainedType}
          sector={null}
          iconFile={typeIconFile(reward.gainedType)}
          spokenText={`gain 1 ${reward.gainedType}`}
        />
      )}
      {stats.map(({ stat, amount }) => (
        <QuestPart
          key={stat}
          amount={`+${String(amount)}`}
          label={STAT_ICONS[stat].label}
          sector={null}
          iconFile={STAT_ICONS[stat].file}
          spokenText={`+${String(amount)} ${STAT_ICONS[stat].label.toLowerCase()}`}
        />
      ))}
      {reward.draws === 0 ? null : <span>draw {counted(reward.draws, "card")}</span>}
    </>
  );
}
