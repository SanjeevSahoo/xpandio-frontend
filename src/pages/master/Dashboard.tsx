import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { shallowEqual } from "react-redux";

import {
  useAccessConfig,
  useAppAccessQuery,
  useMenuConfig,
} from "@/features/authorization/hooks";
import { useAlertConfig, useLoaderConfig } from "@/features/ui/hooks";

import AppList from "@/features/layout/home/AppList";

import { useAppSelector } from "@/store/hooks";
import { APP_MENUS } from "@/features/authorization/menu-list";
import ShowcaseList from "./ShowcaseList";
import { useShowCommunicationDataQuery } from "@/features/master/hooks";
import { IShowcaselist } from "@/features/master/types";

function Dashboard() {
  const { t } = useTranslation(["common", "authentication"]);
  const authState = useAppSelector(({ auth }) => auth, shallowEqual);
  const { setAppAccess } = useAccessConfig();
  const { setSelMenu } = useMenuConfig();
  const alertToast = useAlertConfig();
  const loader = useLoaderConfig();

  const {
    data: appAccessData,
    isLoading: isAppAccessDataLoading,
    isError: isAppAccessDataError,
  } = useAppAccessQuery(authState.ID);

  useEffect(() => {
    if (isAppAccessDataLoading) {
      loader.show();
    } else {
      loader.hide();
    }

    if (!isAppAccessDataLoading && isAppAccessDataError) {
      alertToast.show(
        "error",
        t("form.errors.api_data_fetching", { ns: "common" }),
        true,
      );
    }

    if (!isAppAccessDataLoading && appAccessData) {
      const currAppData = APP_MENUS.filter((item) => item.appId === 1)[0];
      const currDashboardMenu = currAppData.menuList[1];
      setAppAccess(appAccessData);
      setSelMenu(currDashboardMenu);
    }
  }, [appAccessData, isAppAccessDataLoading, isAppAccessDataError]);

  const [showcaseList, setShowcaseList] = useState<IShowcaselist[]>([]);

  const {
    data: showCommunicationData,
    isLoading: isShowCommunicationDataLoading,
    isError: isShowCommunicationDataError,
  } = useShowCommunicationDataQuery(+authState.BASE_LOCN_ID);

  useEffect(() => {
    if (isShowCommunicationDataLoading) {
      loader.show();
    } else {
      loader.hide();
    }
    if (!isShowCommunicationDataLoading && isShowCommunicationDataError) {
      alertToast.show("error", "Error Reading API", true);
    }
    if (
      !isShowCommunicationDataLoading &&
      !isShowCommunicationDataError &&
      showCommunicationData
    ) {
      setShowcaseList([...showCommunicationData.uploadLogHistory]);
    }
  }, [
    showCommunicationData,
    isShowCommunicationDataLoading,
    isShowCommunicationDataError,
  ]);

  const communcationClass =
    showcaseList && showcaseList.length > 0
      ? " grid-cols-[1.5fr_2.5fr] "
      : "grid-cols-[1fr] ";
  return (
    <div
      className={`grid items-start justify-start w-full h-full overflow-auto ${communcationClass} `}
    >
      <div className="w-full h-full p-4 overflow-auto ">
        <AppList screenType="Dashboard" />
      </div>
      {showcaseList && showcaseList.length > 0 && (
        <div className="w-full h-full grid grid-rows-[1fr]  overflow-auto  ">
          {/* <div className="bg-cyan-100 shadow-md border-[1px] uppercase p-2 flex justify-center items-center font-bold text-blue-800">
          Communications
        </div> */}
          <div className="flex items-center justify-center w-full h-full shadow-md border-[1px]">
            <ShowcaseList showcaseList={showcaseList} />
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
