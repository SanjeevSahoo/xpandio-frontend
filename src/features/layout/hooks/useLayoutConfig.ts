import { useAppDispatch } from "@/store/hooks";
import { resetLayout, setLayout } from "../layoutSlice";
import { ILayoutProps } from "../types";

function useLayoutConfig() {
  const dispatch = useAppDispatch();

  return {
    toggleSidebar: (newStatus: boolean) => {
      dispatch(
        setLayout({
          sidebarStatus: newStatus,
          appStatus: false,
          settingStatus: false,
          notificationStatus: false,
        }),
      );
    },
    toggleApp: (newStatus: boolean) => {
      dispatch(
        setLayout({
          sidebarStatus: false,
          appStatus: newStatus,
          settingStatus: false,
          notificationStatus: false,
        }),
      );
    },
    toggleSetting: (newStatus: boolean) => {
      dispatch(
        setLayout({
          sidebarStatus: false,
          appStatus: false,
          settingStatus: newStatus,
          notificationStatus: false,
        }),
      );
    },
    toggleNotification: (newStatus: boolean) => {
      dispatch(
        setLayout({
          sidebarStatus: false,
          appStatus: false,
          settingStatus: false,
          notificationStatus: newStatus,
        }),
      );
    },
    setLayout: (newLayout: ILayoutProps) => {
      dispatch(
        setLayout({
          ...newLayout,
        }),
      );
    },
    resetLayout: () => {
      dispatch(resetLayout());
    },
  };
}

export default useLayoutConfig;
