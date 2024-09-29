import { TypeCalendarItem } from "./typeCalendarItem"

export interface CurrentDate {
    currentDateISO: string;
    bonusTypes: TypeCalendarItem;
    restartsRemaining: number;
    lastRestartTime: string;
    minutesRemainingUntilNextSlot: number;
    currentDateGMT8: string
    hoursUntilNewDay: number
    minutesUntilNewDay: number
}