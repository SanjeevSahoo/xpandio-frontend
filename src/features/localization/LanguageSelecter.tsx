import React from "react";
import { useTranslation } from "react-i18next";
import { shallowEqual } from "react-redux";
import { useAppSelector } from "@/store/hooks";
import { Select } from "../ui/elements";

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
function LanguageSelector(props: IProps) {
  const { mode, disableTabFocus, className } = props;
  const { i18n } = useTranslation(["common", "authentication"]);
  const globalState = useAppSelector(({ global }) => global, shallowEqual);

  let appModeClass =
    mode === "FullScreen" && globalState.appMode === "FullScreen"
      ? " bg-[#3f4d67] border-gray-500 placeholder-gray-400 text-white"
      : " ";
  if (mode === "Auth") {
    appModeClass = "bg-transparent border-cyan-900 text-cyan-400";
  }
  return (
    <div>
      <Select
        disableTabFocus={disableTabFocus}
        className={`rounded-lg ${appModeClass} ${className} `}
        value={i18n.resolvedLanguage}
        onChange={(e) => {
          i18n.changeLanguage(e.target.value);
        }}
      >
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="mr">Marathi</option>
      </Select>
    </div>
  );
}

LanguageSelector.defaultProps = defaultProps;
export default LanguageSelector;
