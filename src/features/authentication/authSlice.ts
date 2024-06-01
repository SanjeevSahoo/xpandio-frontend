import { createSlice } from "@reduxjs/toolkit";
import { IAuthenticatedUser } from "./types";

const initialState: IAuthenticatedUser = {
  ID: 0,
  NAME: "",
  TICKET_NO: "",
  ROLES: [],
  BASE_LOCN_ID: 0,
  AUTH_TOKEN: "",
  PHOTO_PATH: "",
  LOGGED_IN: 0,
};
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoggedUser: (state, action) => {
      state.ID = action.payload.ID;
      state.NAME = action.payload.NAME;
      state.TICKET_NO = action.payload.TICKET_NO;
      state.ROLES = action.payload.ROLES;
      state.BASE_LOCN_ID = action.payload.BASE_LOCN_ID;
      state.AUTH_TOKEN = action.payload.AUTH_TOKEN;
      state.PHOTO_PATH = action.payload.PHOTO_PATH;
      state.LOGGED_IN = action.payload.LOGGED_IN;
    },
    setAuthToken: (state, action) => {
      state.AUTH_TOKEN = action.payload;
    },
    resetAuth: () => {
      return initialState;
    },
  },
});

export const { setLoggedUser, setAuthToken, resetAuth } = authSlice.actions;

export default authSlice.reducer;
