import React from "react";
import dayjs from "dayjs";
import { shallowEqual } from "react-redux";

import LogoutTimer from "@/features/authentication/LogoutTimer";
import { useAppSelector } from "@/store/hooks";
import RaiseIssue from "@/pages/RaiseIssue";

const currYear = dayjs(new Date()).format("YYYY");

function HomeFooter() {
  const globalState = useAppSelector(({ global }) => global, shallowEqual);
  const hiddenClass =
    globalState.appMode === "Normal"
      ? "flex justify-between items-center"
      : "hidden";
  return (
    <div
      className={`${hiddenClass} p-2 px-4   dark:bg-gray-800 shadow-md dark:text-gray-300`}
    >
      <div className="text-xs text-gray-400">
        Copyright © {currYear} : Xpandio Platform.{" "}
        <span className="pl-1 pr-1">Design and Developed by</span>
        <span className="font-bold">Xpandio Team</span>
      </div>
      <div className="flex items-center justify-start">
        <div className="pr-16">
          <LogoutTimer />
        </div>
        <div className="absolute bottom-0 right-10">
          <RaiseIssue />
        </div>
      </div>
    </div>
  );
}

export default HomeFooter;
