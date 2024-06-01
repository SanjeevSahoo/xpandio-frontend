import React, { useEffect } from "react";
import { shallowEqual } from "react-redux";
import { XMarkIcon } from "@heroicons/react/24/solid";

import { useAppSelector } from "@/store/hooks";
import { useAlertNotificationConfig } from "../hooks";

function AlertNotification() {
  const alertNotificationToast = useAlertNotificationConfig();
  const alertNotificationState = useAppSelector(
    ({ alertNotification }) => alertNotification,
    shallowEqual,
  );

  const visibleClass = alertNotificationState.status
    ? "bottom-[35px] right-[25px]"
    : "-bottom-[35px] -right-[25px] hidden";

  useEffect(() => {
    if (alertNotificationState.status && alertNotificationState.autoClose) {
      setTimeout(() => {
        alertNotificationToast.hideAlert();
      }, alertNotificationState.autoCloseTime);
    }
  }, [alertNotificationState]);

  return (
    <div
      className={`absolute ${visibleClass} z-50 max-h-[200px] w-[200px] rounded-lg border-[2px] border-blue-200 bg-amber-100 flex items-center gap-2 p-3 transition-all ease-in-out delay-150  max-w-sm md:max-w-md lg:max-w-lg shadow-md`}
    >
      <div className="mr-auto text-sm font-normal">
        {alertNotificationState.message}
      </div>
      <button
        type="button"
        className="p-1 ml-2 rounded-lg"
        onClick={() => {
          alertNotificationToast.hideAlert();
        }}
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
}

export default AlertNotification;
