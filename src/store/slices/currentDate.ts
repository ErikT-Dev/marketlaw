import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { typesCalendar } from "../data";
import { TypeCalendarItem } from "../interfaces/typeCalendarItem";
import { CurrentDate } from "../interfaces/currentDate";

const MAX_RESTARTS = 3;
const RESTART_COOLDOWN_MINUTES = 60;

const getCurrentDateTimeUTC = () => {
    return new Date().toISOString();
};

const formatDisplayDate = (isoString: string) => {
    return new Intl.DateTimeFormat('en-GB', {
        dateStyle: 'medium',
        timeStyle: "short",
        timeZone: 'Etc/GMT-8',
    }).format(new Date(isoString));
};

const calculateTimeUntilNewDay = (dateGMT8: string) => {
    const [datePart, timePart] = dateGMT8.split(', ');
    const [hours, minutes] = timePart.split(':').map(Number);

    const hoursUntilNewDay = 23 - hours;
    const minutesUntilNewDay = 60 - minutes;

    return { hoursUntilNewDay, minutesUntilNewDay };
};

const initialDateISO = getCurrentDateTimeUTC();
const initialDateGMT8 = formatDisplayDate(initialDateISO);
const initialTimeUntilNewDay = calculateTimeUntilNewDay(initialDateGMT8);

const currentDateSlice = createSlice({
    name: 'currentDate',
    initialState: {
        currentDateISO: initialDateISO,
        bonusTypes: typesCalendar.find(date => date.date === initialDateGMT8.split(',')[0]) as TypeCalendarItem,
        restartsRemaining: MAX_RESTARTS,
        lastRestartTime: initialDateISO,
        minutesRemainingUntilNextSlot: 0,
        currentDateGMT8: initialDateGMT8,
        hoursUntilNewDay: initialTimeUntilNewDay.hoursUntilNewDay,
        minutesUntilNewDay: initialTimeUntilNewDay.minutesUntilNewDay
    } as CurrentDate,
    reducers: {
        updateCurrentDate(state) {
            const now = new Date();
            const newDateISO = now.toISOString();
            state.currentDateISO = newDateISO;
            state.currentDateGMT8 = formatDisplayDate(newDateISO);
            const newDate = state.currentDateGMT8.split(',')[0];
            state.bonusTypes = typesCalendar.find(date => date.date === newDate) as TypeCalendarItem;

            const { hoursUntilNewDay, minutesUntilNewDay } = calculateTimeUntilNewDay(state.currentDateGMT8);
            state.hoursUntilNewDay = hoursUntilNewDay;
            state.minutesUntilNewDay = minutesUntilNewDay;

            // Refresh restart slots
            const lastRestart = new Date(state.lastRestartTime);
            const minutesPassed = (now.getTime() - lastRestart.getTime()) / (1000 * 60);
            const slotsToAdd = Math.floor(minutesPassed / RESTART_COOLDOWN_MINUTES);

            if (slotsToAdd > 0) {
                state.restartsRemaining = Math.min(state.restartsRemaining + slotsToAdd, MAX_RESTARTS);
                state.lastRestartTime = newDateISO;
                state.minutesRemainingUntilNextSlot = 0;
            } else if (state.restartsRemaining < MAX_RESTARTS) {
                state.minutesRemainingUntilNextSlot = Math.ceil(RESTART_COOLDOWN_MINUTES - (minutesPassed % RESTART_COOLDOWN_MINUTES));
            } else {
                state.minutesRemainingUntilNextSlot = 0;
            }
        },
        updateRestartSlots(state, action: PayloadAction<number>) {
            const slotsToAdd = action.payload;
            const newRestartsRemaining = Math.max(0, Math.min(state.restartsRemaining + slotsToAdd, MAX_RESTARTS));

            if (slotsToAdd < 0) {
                // Using restart slots
                if (state.restartsRemaining === MAX_RESTARTS) {
                    // If we're using the first slot (going from max to max-1), reset the timer
                    state.lastRestartTime = getCurrentDateTimeUTC();
                    state.minutesRemainingUntilNextSlot = RESTART_COOLDOWN_MINUTES;
                }
                // In all other cases, keep the existing timer
            } else if (slotsToAdd > 0) {
                if (newRestartsRemaining === MAX_RESTARTS) {
                    // If we've refilled to max, reset cooldown
                    state.minutesRemainingUntilNextSlot = 0;
                }
                // In all other cases of adding slots, keep the existing timer
            }

            state.restartsRemaining = newRestartsRemaining;
        },
    }
});

export const { updateCurrentDate, updateRestartSlots } = currentDateSlice.actions;
export const currentDateReducer = currentDateSlice.reducer;