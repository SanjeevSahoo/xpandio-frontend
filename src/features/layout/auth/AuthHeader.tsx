import React from "react";
import { APP_VERSION } from "@/features/common/constants";
import DarkThemeToggler from "@/features/theme/DarkThemeToggler";
import LanguageSelector from "@/features/localization/LanguageSelecter";
import ITicketRaise from "../ITicketRaise";

function AuthHeader() {
  return (
    <div className="flex items-center justify-between p-2 px-4 shadow-md dark:bg-gray-800">
      <h2 className="text-xl font-bold text-blue-900 md:text-2xl dark:text-blue-400 ">
        <span className="text-transparent bg-gradient-to-br from-gray-300 to-cyan-600 bg-clip-text ">
          Xpandio
        </span>{" "}
        <span className="text-sm text-transparent bg-gradient-to-br from-gray-300 to-cyan-600 bg-clip-text dark:from-cyan-600 dark:to-gray-300">
          {APP_VERSION}
        </span>
      </h2>

      <div className="flex items-center gap-4 justify-evenly">
        <LanguageSelector mode="Auth" />
        <DarkThemeToggler mode="Auth" />
        <ITicketRaise mode="Auth" />
      </div>
    </div>
  );
}

export default AuthHeader;
