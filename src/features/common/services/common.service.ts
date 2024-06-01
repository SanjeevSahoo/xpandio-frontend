import { AxiosResponse } from "axios";
import http from "@/features/common/utils/http-common";
import IOrgData from "@/features/common/types/IOrgData";

const getWisOrgData = (wisType: string) => {
  return http.post<any, AxiosResponse<IOrgData>>("/common/wis-orgdata", {
    wisType,
  });
};
const getOrgData = () => {
  return http.get<any, AxiosResponse<IOrgData>>("/common/orgdata");
};

const getDBDate = () => {
  return http.get<any, AxiosResponse<{ currDate: string }>>(
    "/common/get-db-date",
  );
};

export { getOrgData, getDBDate, getWisOrgData };
