import React, { useEffect } from "react";
import { shallowEqual } from "react-redux";
import { SunIcon, MoonIcon } from "@heroicons/react/24/solid";
import { useAppSelector } from "@/store/hooks";
import { useThemeConfig } from "./hooks";
import IconButton from "../ui/buttons/IconButton";

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
function DarkThemeToggler(props: IProps) {
  const { mode, disableTabFocus, className } = props;
  const themeState = useAppSelector(({ theme }) => theme, shallowEqual);
  const globalState = useAppSelector(({ global }) => global, shallowEqual);
  const { toggleDarkTheme } = useThemeConfig();
  let appModeClass =
    mode === "FullScreen" && globalState.appMode === "FullScreen"
      ? " text-gray-300 bg-gray-500 hover:bg-gray-400"
      : "";
  if (mode === "Auth") {
    appModeClass =
      "bg-cyan-100 bg-opacity-20 text-cyan-400 hover:bg-cyan-200 hover:bg-opacity-100 hover:text-cyan-900";
  }
  useEffect(() => {
    if (themeState.isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [themeState]);
  return (
    <div>
      <IconButton
        disableTabFocus={disableTabFocus}
        onClick={() => {
          toggleDarkTheme({ isDarkMode: !themeState.isDarkMode });
        }}
        className={`${appModeClass} ${className}`}
      >
        {themeState.isDarkMode ? (
          <SunIcon className="w-5 h-5 " title="Theme" />
        ) : (
          <MoonIcon className="w-5 h-5 " title="Theme" />
        )}
      </IconButton>
    </div>
  );
}

DarkThemeToggler.defaultProps = defaultProps;
export default DarkThemeToggler;
