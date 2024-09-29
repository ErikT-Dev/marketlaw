import { createSlice } from "@reduxjs/toolkit";
import { TutorialData } from "../interfaces/tutorialData";

const tutorialDataSlice = createSlice({
    name: 'tutorialData',
    initialState: {
        tutorialOn: true,
        tutorialStep: 1
    } as TutorialData,
    reducers: {
        setTutorialData(state, action: { payload: TutorialData }) {
            state.tutorialOn = action.payload.tutorialOn
            state.tutorialStep = action.payload.tutorialStep
        }
    }
})

export const { setTutorialData } = tutorialDataSlice.actions
export const tutorialDataReducer = tutorialDataSlice.reducer