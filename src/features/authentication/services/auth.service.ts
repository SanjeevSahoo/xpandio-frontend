import { AxiosResponse } from "axios";
import http from "@/features/common/utils/http-common";
import { IAuthenticatedUser } from "../types";
import { encryptData } from "@/features/common/utils/crypto";

interface IAuthLoginInput {
  domainId: string;
  domainPassword: string;
}

const authenticateDomainLogin = (domainId: string, domainPassword: string) => {
  const encDomainId = encryptData(domainId);
  const encPassword = encryptData(domainPassword);
  return http.post<
    IAuthLoginInput,
    AxiosResponse<{ userData: string; authToken: string }>
  >("/auth/login", {
    loginType: "Domain",
    scannedType: "",
    domainId: encDomainId,
    domainPassword: encPassword,
  });
};

const refreshToken = (token: string) => {
  return http.post<IAuthLoginInput, AxiosResponse<IAuthenticatedUser>>(
    "/auth/refreshtoken",
    {
      token,
    },
  );
};
const logout = (ticketNo: string) => {
  return http.post<string, AxiosResponse<any>>("/auth/logout", {
    ticketNo,
  });
};
const logoutConcurrentLogin = (ticketNo: string) => {
  return http.post<string, AxiosResponse<any>>("/auth/logoutConcurrentLogin", {
    ticketNo,
  });
};

export { authenticateDomainLogin, refreshToken, logout, logoutConcurrentLogin };
