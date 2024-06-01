import React, { useEffect } from "react";
import { shallowEqual } from "react-redux";
import { io } from "socket.io-client";
import { useAppSelector } from "@/store/hooks";
import AppToggler from "./AppToggler";
import SidebarToggler from "./SidebarToggler";
import SettingToggler from "./SettingToggler";
import HomeToggler from "./HomeToggler";
import { SOCKET_BASE_URL } from "@/features/common/constants";

function HomeHeader() {
  const menuState = useAppSelector(({ menu }) => menu, shallowEqual);

  const globalState = useAppSelector(({ global }) => global, shallowEqual);

  const hiddenClass =
    globalState.appMode === "Normal"
      ? "flex justify-between items-center"
      : "hidden";
  useEffect(() => {
    const newSocket = io(SOCKET_BASE_URL, {
      path: "/xpandio-websocket",
      transports: ["websocket"],
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <div
      className={`h-[55px] ${hiddenClass} p-2 px-4 bg-[#313e57] dark:bg-gray-800 shadow-md`}
    >
      <h2 className="flex items-center text-xl font-bold text-blue-900 md:text-2xl dark:text-blue-400 ">
        <SidebarToggler className="text-gray-300 bg-gray-600 hover:bg-gray-500" />
        <span className="mx-4 text-[14px] font-medium text-center text-white dark:text-cyan-200">
          {menuState.name}
        </span>
      </h2>

      <div className="flex items-center gap-4 justify-evenly">
        <HomeToggler className="text-gray-300 bg-gray-600 hover:bg-gray-500" />
        <AppToggler className="text-gray-300 bg-gray-600 hover:bg-gray-500" />
        <SettingToggler className="text-gray-300 bg-gray-600 hover:bg-gray-500" />
      </div>
    </div>
  );
}

export default HomeHeader;
