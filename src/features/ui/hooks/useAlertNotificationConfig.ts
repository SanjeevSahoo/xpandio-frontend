import { useAppDispatch } from "@/store/hooks";
import {
  showAlertNotificationToast,
  hideAlertNotificationToast,
} from "../alertNotificationToastSlice";

function useAlertNotificationConfig() {
  const dispatch = useAppDispatch();

  return {
    showAlert: (
      message: string,
      autoClose: boolean,
      autoCloseTime?: number,
    ) => {
      dispatch(
        showAlertNotificationToast({ message, autoClose, autoCloseTime }),
      );
    },
    hideAlert: () => {
      dispatch(hideAlertNotificationToast());
    },
  };
}

export default useAlertNotificationConfig;
