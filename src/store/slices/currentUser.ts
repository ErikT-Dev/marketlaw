import { createSlice } from "@reduxjs/toolkit";
import { CurrentUser } from "../interfaces/currentUser";

const currentUserSlice = createSlice({
    name: 'currentUser',
    initialState: {} as CurrentUser,
    reducers: {
        logIn(state, action) {
            state.displayName = action.payload.displayName
            state.email = action.payload.email
            state.uid = action.payload.uid
        },
        logOut(state) {
            state.displayName = null
            state.email = null
            state.uid = null
        }
    }
})

export const { logIn, logOut } = currentUserSlice.actions
export const currentUserReducer = currentUserSlice.reducer