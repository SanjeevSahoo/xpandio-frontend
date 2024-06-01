import React from "react";
import { shallowEqual } from "react-redux";
import {
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
} from "@heroicons/react/24/solid";
import { useAppSelector } from "@/store/hooks";
import { useLayoutConfig } from "../hooks";
import { useGlobalConfig } from "@/features/common/hooks";
import { IconButton } from "@/features/ui/buttons";

interface IProps {
  disableTabFocus?: boolean;
  className?: string;
}

const defaultProps = {
  disableTabFocus: false,
  className: "",
};
function AppModeToggler(props: IProps) {
  const { disableTabFocus, className } = props;
  const globalState = useAppSelector(({ global }) => global, shallowEqual);
  const { setAppMode } = useGlobalConfig();
  const { toggleSetting } = useLayoutConfig();
  const { toggleNotification } = useLayoutConfig();
  const appModeClass =
    globalState.appMode === "FullScreen"
      ? "  bg-gray-400 text-cyan-200 hover:text-blue-900 dark:text-white "
      : "";
  return (
    <div>
      <IconButton
        disableTabFocus={disableTabFocus}
        onClick={() => {
          setAppMode(
            globalState.appMode === "Normal" ? "FullScreen" : "Normal",
          );
          toggleSetting(false);
          toggleNotification(false);
        }}
        className={`pr-4  ${appModeClass} ${className}`}
      >
        {globalState.appMode === "Normal" ? (
          <>
            <ArrowsPointingOutIcon className="w-5 h-5 " />
            <p className="font-normal">Full Screen</p>
          </>
        ) : (
          <>
            <ArrowsPointingInIcon className="w-5 h-5 " />
            <p className="font-normal">Normal</p>
          </>
        )}
      </IconButton>
    </div>
  );
}

AppModeToggler.defaultProps = defaultProps;
export default AppModeToggler;
