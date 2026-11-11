import type { GameRecordSeat } from "../../../shared/api/GameRecordSeat";
import type { IconText } from "../../components/IconText";

export function comboGainsText({ comboGains }: GameRecordSeat): IconText {
  return [
    { stat: "workforce", value: `+${String(comboGains.workforce)}` },
    { stat: "quality", value: `+${String(comboGains.quality)}` },
    { stat: "satisfaction", value: `+${String(comboGains.satisfaction)}` },
  ];
}
