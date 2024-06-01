import React from "react";
import { shallowEqual } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useAppSelector } from "@/store/hooks";
import { ASSET_BASE_URL } from "@/features/common/constants";
import { APP_MENUS } from "@/features/authorization/menu-list";
import { useAccessConfig, useMenuConfig } from "@/features/authorization/hooks";
import { AlertInfo } from "@/features/ui/alerts";

interface IProps {
  screenType: string;
  disableTabFocus?: boolean;
}

const defaultProps = {
  disableTabFocus: false,
};
function AppList(props: IProps) {
  const { screenType, disableTabFocus } = props;
  const accessState = useAppSelector(({ access }) => access, shallowEqual);
  const { setSelMenu } = useMenuConfig();
  const { setApp } = useAccessConfig();
  const navigate = useNavigate();
  const handleAppSelection = (appId: number) => {
    const currAppData = APP_MENUS.filter((item) => item.appId === appId)[0];
    const currDashboardMenu = currAppData.menuList[1];

    setApp(appId);
    setSelMenu(currDashboardMenu);
    if (appId === 7) {
      navigate(`/${currAppData.routeMaster}/${currDashboardMenu.path}`, {
        replace: true,
      });
    } else {
      navigate(`/${currAppData.routeMaster}/${currDashboardMenu.path}`, {
        replace: true,
      });
    }
    // navigate(`/${currAppData.routeMaster}/${currDashboardMenu.path}`, {
    //   replace: true,
    // });
  };
  const popupGridClass =
    screenType === "Popup"
      ? " grid-cols-[repeat(auto-fit,115px)] gap-x-2 gap-y-6 p-2"
      : " grid-cols-[repeat(auto-fit,200px)] gap-4 gap-y-6 p-2";
  const popupMainClass =
    screenType === "Popup"
      ? "grid-rows-[1fr_1fr] h-[130px] border-[1px] border-gray-200 dark:border-gray-500 bg-[#ffffffc9] hover:bg-blue-50 dark:bg-gray-500 dark:hover:bg-gray-600"
      : "grid-rows-[1fr_1fr_1fr] h-[225px] bg-[#ffffffc9] hover:bg-blue-50 dark:bg-gray-600 dark:hover:bg-gray-500";
  const popupImgClass = screenType === "Popup" ? "p-2" : "p-2";
  const popupTextClass =
    screenType === "Popup"
      ? "text-[11px] font-bold p-1"
      : "text-[14px] font-bold p-2";
  const popupAppDescClass = screenType === "Popup" ? "hidden" : "";
  if (accessState.apps.filter((item) => item.ID !== 1).length <= 0) {
    return (
      <AlertInfo
        heading="You donot have access on any App"
        message="All available apps that you have access to is listed here. But it
      seems you donot have access to a single app. Kindly contact
      Application Support for access"
      />
    );
  }
  return (
    <div
      className={`w-full overflow-auto grid items-center justify-evenly ${popupGridClass}`}
    >
      {accessState.apps
        .filter((item) => item.ID !== 1)
        .map((app) => (
          <button
            tabIndex={disableTabFocus ? -1 : 0}
            type="button"
            key={app.ID}
            onClick={() => {
              handleAppSelection(app.ID);
            }}
          >
            <div
              className={`grid overflow-hidden items-center justify-center shadow-lg p-2 rounded-md   ${popupMainClass}`}
            >
              <div
                className={`flex flex-1 items-center justify-center ${popupImgClass}`}
              >
                <img
                  src={`${ASSET_BASE_URL}images/logo/${app.LOGO_PATH}`}
                  alt={app.SHT_NAME}
                  width={screenType === "Popup" ? "45" : "80"}
                />
              </div>
              <h3
                className={`flex flex-col items-center justify-center text-center  text-blue-900 dark:text-teal-100 ${popupTextClass}`}
              >
                {app.NAME}
                {screenType === "Popup" ? "" : <span>({app.SHT_NAME})</span>}
              </h3>
              <p
                className={`flex item-center justify-center text-center text-[11px] font-normal text-slate-500 dark:text-slate-300 ${popupAppDescClass}`}
              >
                {app.APP_DESC}
              </p>
            </div>
          </button>
        ))}
    </div>
  );
}

AppList.defaultProps = defaultProps;
export default AppList;
