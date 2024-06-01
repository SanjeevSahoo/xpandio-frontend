import { AxiosResponse } from "axios";
import http from "@/features/common/utils/http-common";
import {
  IAddAppForm,
  IAddLocnForm,
  IAddMenuForm,
  IAddRoleForm,
  IAppsList,
  IConfigAndLocn,
  IConfigForm,
  ILocnList,
  IMenuList,
} from "../types";
import IConfigItemData from "../types/IConfigItemData";
import IRoleList from "../types/IRoleList";
import IMenuAccessList from "../types/IMenuAccessList";
import IAlertNotificationList from "@/features/layout/types/IAlertNotificationList";

const getConfigData = () => {
  return http.post<any, AxiosResponse<IConfigAndLocn>>(
    "/master/get-config-details",
    {},
  );
};
const addConfigItemData = (AddItemConfigData: IConfigForm) => {
  return http.post<IConfigForm, AxiosResponse<string>>(
    "/master/add-config-item-details",
    AddItemConfigData,
  );
};

const updateConfigItemData = (UpdateItemConfigData: IConfigForm) => {
  return http.post<IConfigForm, AxiosResponse<string>>(
    "/master/update-config-item-details",
    UpdateItemConfigData,
  );
};

const getConfigItemData = (item: number) => {
  return http.post<
    {
      item: number;
    },
    AxiosResponse<IConfigItemData>
  >("/master/get-config-item-details", { item });
};
const getRoles = () => {
  return http.post<any, AxiosResponse<{ RolesList: IRoleList[] }>>(
    "/master/get-roles-list",
    {},
  );
};

const addRoles = (AddRolesData: IAddRoleForm) => {
  return http.post<IAddRoleForm, AxiosResponse<string>>(
    "/master/add-roles-data",
    AddRolesData,
  );
};

const updateRoles = (UpdateRolesData: IAddRoleForm) => {
  return http.post<IAddRoleForm, AxiosResponse<string>>(
    "/master/update-roles-data",
    UpdateRolesData,
  );
};

const getApps = () => {
  return http.post<any, AxiosResponse<{ AppsList: IAppsList[] }>>(
    "/master/get-apps-list",
    {},
  );
};

const addApps = (AddAppsData: IAddAppForm) => {
  return http.post<IAddAppForm, AxiosResponse<string>>(
    "/master/add-apps-data",
    AddAppsData,
  );
};

const updateApps = (updateAppsData: IAddAppForm) => {
  return http.post<IAddAppForm, AxiosResponse<string>>(
    "/master/update-apps-data",
    updateAppsData,
  );
};

const getLocations = () => {
  return http.post<any, AxiosResponse<{ LocationsList: ILocnList[] }>>(
    "/master/get-locns",
    {},
  );
};

const addLocns = (AddLocnsData: IAddLocnForm) => {
  return http.post<IAddLocnForm, AxiosResponse<string>>(
    "/master/add-locns-data",
    AddLocnsData,
  );
};

const updateLocns = (updateLocnsData: IAddLocnForm) => {
  return http.post<IAddLocnForm, AxiosResponse<string>>(
    "/master/update-locns-data",
    updateLocnsData,
  );
};

const getMenus = (app: number) => {
  return http.post<{ app: number }, AxiosResponse<{ MenusList: IMenuList[] }>>(
    "/master/get-menus-list",
    { app },
  );
};

const addMenus = (AddMenusData: IAddMenuForm) => {
  return http.post<IAddMenuForm, AxiosResponse<string>>(
    "/master/add-menus-list",
    AddMenusData,
  );
};

const updateMenus = (updateMenusData: IAddMenuForm) => {
  return http.post<IAddMenuForm, AxiosResponse<string>>(
    "/master/update-menus-data",
    updateMenusData,
  );
};

const menuAccessList = (role: number) => {
  return http.post<
    { role: number },
    AxiosResponse<{ MenusAccessList: IMenuAccessList[] }>
  >("/master/get-menus-access-list", { role });
};

const MenuAccessUpdate = (
  menuAccessDataUpdate: Array<string>,
  role: number,
) => {
  return http.post<
    { menuAccessDataUpdate: Array<string>; role: number },
    AxiosResponse<{
      updateAccess: string;
    }>
  >("/master/menu-access-update", { menuAccessDataUpdate, role });
};

const getAlertNotifications = (team_id: Array<number>) => {
  return http.post<
    { team_id: number[] },
    AxiosResponse<{ alertNotificationList: IAlertNotificationList[] }>
  >("/master/get-alert-notifications", { team_id });
};
export {
  getConfigData,
  addConfigItemData,
  updateConfigItemData,
  getRoles,
  getConfigItemData,
  addMenus,
  getMenus,
  updateMenus,
  addRoles,
  getApps,
  addApps,
  updateRoles,
  updateApps,
  getLocations,
  addLocns,
  updateLocns,
  menuAccessList,
  MenuAccessUpdate,
  getAlertNotifications,
};
