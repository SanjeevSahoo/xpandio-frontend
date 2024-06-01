import React from "react";
import { shallowEqual } from "react-redux";
import { Cog6ToothIcon } from "@heroicons/react/24/outline";

import { useAppSelector } from "@/store/hooks";
import { useLayoutConfig } from "../hooks";

import { IconButton } from "@/features/ui/buttons";

interface IProps {
  mode?: string;
  disableTabFocus?: boolean;
  className?: string;
}

const defaultProps = {
  mode: "",
  disableTabFocus: false,
  className: "",
};

function SettingToggler(props: IProps) {
  const { mode, disableTabFocus, className } = props;
  const layoutState = useAppSelector(({ layout }) => layout, shallowEqual);
  const globalState = useAppSelector(({ global }) => global, shallowEqual);
  const layoutStatus = useLayoutConfig();

  const hiddenClass =
    mode && mode === "FullScreen" && globalState.appMode === "Normal"
      ? " hidden "
      : "";
  const appModeClass =
    globalState.appMode === "FullScreen"
      ? "  bg-gray-400 text-cyan-200 hover:text-blue-900 dark:text-white "
      : "";

  const handleSettingsToggle = () => {
    if (mode === "FullScreen" && globalState.appMode === "FullScreen") {
      layoutStatus.setLayout({
        sidebarStatus: true,
        appStatus: false,
        settingStatus: !layoutState.settingStatus,
        notificationStatus: false,
      });
    } else {
      layoutStatus.toggleSetting(!layoutState.settingStatus);
    }
  };
  return (
    <IconButton
      disableTabFocus={disableTabFocus}
      onClick={handleSettingsToggle}
      className={`${hiddenClass} ${appModeClass} ${className}`}
    >
      <Cog6ToothIcon className="w-5 h-5 " title="Setting" />
      {mode === "FullScreen" && globalState.appMode === "FullScreen" && (
        <p className="font-normal pr-2.5">Settings</p>
      )}
    </IconButton>
  );
}

SettingToggler.defaultProps = defaultProps;
export default SettingToggler;
