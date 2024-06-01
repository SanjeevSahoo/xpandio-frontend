import { createSlice } from "@reduxjs/toolkit";
import { IAlertNotificationProps } from "./types";

const initialState: IAlertNotificationProps = {
  status: false,
  message: "",
  autoClose: true,
  autoCloseTime: 4000,
};
const alertNotificationToastSlice = createSlice({
  name: "alertnotificationtoast",
  initialState,
  reducers: {
    showAlertNotificationToast: (state, action) => {
      state.status = true;
      state.message = action.payload.message;
      state.autoClose = action.payload.autoClose;
      state.autoCloseTime = action.payload.autoCloseTime;
      if (action.payload.autoCloseTime) {
        state.autoCloseTime = action.payload.autoCloseTime;
      } else {
        state.autoCloseTime = 10000;
      }
    },
    hideAlertNotificationToast: (state) => {
      state.status = false;
    },
  },
});

export const { showAlertNotificationToast, hideAlertNotificationToast } =
  alertNotificationToastSlice.actions;

export default alertNotificationToastSlice.reducer;
