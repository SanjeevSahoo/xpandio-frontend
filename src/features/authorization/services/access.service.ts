import { AxiosResponse } from "axios";
import http from "@/features/common/utils/http-common";
import IAppAccess from "../types/IAppAccess";

const getAppAccess = () => {
  return http.get<any, AxiosResponse<IAppAccess>>("/access/appaccess");
};

const getMenuAccess = (menuId: number) => {
  return http.post<any, AxiosResponse<{ hasAccess: boolean }>>(
    "/access/get-menu-access",
    {
      menuId,
    },
  );
};

export { getAppAccess, getMenuAccess };
