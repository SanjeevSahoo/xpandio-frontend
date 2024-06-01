import React from "react";
import dayjs from "dayjs";

const currYear = dayjs(new Date()).format("YYYY");

function AuthFooter() {
  return (
    <div className="flex items-end justify-between p-2 px-4 shadow-md dark:bg-gray-800 dark:text-gray-300">
      <div className="text-xs text-gray-500">
        Copyright © {currYear} : Xpandio Platform.{" "}
        <span className="pl-1 pr-1">Design and Developed by</span>
        <span className="font-bold">Xpandio Team</span>
      </div>
    </div>
  );
}

export default AuthFooter;
