import React from "react";
import { Outlet } from "react-router-dom";

import AlertToast from "@/features/ui/alerts/AlertToast";
import AlertNotification from "@/features/ui/alerts/AlertNotification";
import AuthFooter from "./AuthFooter";
import AuthHeader from "./AuthHeader";
import BoxLoader from "@/features/ui/loader/BoxLoader";

function AuthLayout() {
  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="w-full h-full bg-[#f4f7fa]  dark:bg-gradient-to-t dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 dark:bg-gray-900 bg-[url('@/assets/images/auth_back3.jpg')] bg-cover bg-center">
        <div className="w-full h-full overflow-hidden grid grid-rows-[auto_1fr_auto] box-border   ">
          <AuthHeader />
          <Outlet />
          <AuthFooter />
        </div>
      </div>
      <AlertToast />
      <AlertNotification />
      <BoxLoader />
    </div>
  );
}

export default AuthLayout;
