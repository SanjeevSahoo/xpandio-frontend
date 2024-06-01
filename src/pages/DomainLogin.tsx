import React, { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useForm, SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { IAuthForm } from "@/features/authentication/types";
import { TextField } from "@/features/ui/form";
import LoginIcon from "@/assets/images/login_icon_light.jpg";
import {
  getLoggedIn,
  setLocalUser,
} from "@/features/common/utils/local-storage";
import {
  authenticateDomainLogin,
  logoutConcurrentLogin,
} from "@/features/authentication/services/auth.service";
import { useGlobalConfig } from "@/features/common/hooks";
import { useAlertConfig, useLoaderConfig } from "@/features/ui/hooks";
import { useAuthConfig } from "@/features/authentication/hooks";
import { ConfirmBox } from "@/features/ui/alerts";
import { decryptData } from "@/features/common/utils/crypto";

const initialFormValues: IAuthForm = {
  domainId: "",
  domainPassword: "",
};

function DomainLogin() {
  const { t } = useTranslation(["authentication", "common"]);
  const { setLoginType } = useGlobalConfig();
  const { setLoggedUser } = useAuthConfig();
  const navigate = useNavigate();
  const alertToast = useAlertConfig();
  const loader = useLoaderConfig();

  const formSchema = Yup.object().shape({
    domainId: Yup.string()
      .trim()
      .required(t("form.yup.required_domain_id"))
      .max(20, t("form.yup.max_domain_id", { max: 20 })),
    domainPassword: Yup.string()
      .trim()
      .required(t("form.yup.required_password"))
      .min(6, t("form.yup.min_password", { min: 6 }))
      .max(50, t("form.yup.max_password", { max: 50 })),
  });

  const { handleSubmit, control, formState, setValue } = useForm<IAuthForm>({
    defaultValues: initialFormValues,
    resolver: yupResolver(formSchema),
  });

  const [confirmState, setConfirmState] = useState({
    status: false,
    value: "cancel",
    message: "",
    handleConfirmOk: () => {},
    handleConfirmCancel: () => {},
  });
  const handleConfirmCancel = () => {
    setConfirmState((oldState) => ({
      ...oldState,
      status: false,
      value: "cancel",
    }));
  };
  const { isSubmitting } = formState;
  const handleFormSubmit: SubmitHandler<IAuthForm> = (values) => {
    loader.show();
    authenticateDomainLogin(values.domainId, values.domainPassword)
      .then((res) => {
        const decryptUserData = decryptData(`${res.data.userData}`);
        const { authToken } = res.data;
        const userObj = JSON.parse(decryptUserData);
        userObj.AUTH_TOKEN = authToken;
        // console.log("after decrypt data will be", decryptUserData);
        const currLoggedIn = getLoggedIn();
        if (currLoggedIn === "Yes") {
          alertToast.show(
            "warning",
            "You are already logged in a different tab/windows, Logged out old login, Please try again",
            true,
            4000,
          );
          localStorage.removeItem("user-xpandio");
          localStorage.removeItem("loggedin-xpandio");
          localStorage.removeItem("reloadcounter-xpandio");
          sessionStorage.removeItem("persist:root-xpandio");
        } else if (userObj.LOGGED_IN === 1) {
          setConfirmState({
            status: true,
            value: "cancel",
            message:
              "You might be logged in from different device. Do you wish to log off from other device and login to this device?",
            handleConfirmCancel,
            handleConfirmOk: () => {
              logoutConcurrentLogin(userObj.TICKET_NO);
              setLocalUser(userObj);
              alertToast.show(
                "success",
                t("form.success.login_successfull"),
                true,
                2000,
              );
              console.log("loggedin", userObj);
              setLoggedUser(userObj);
              navigate("/master", { replace: true });
            },
          });
        } else {
          setLocalUser(userObj);
          alertToast.show(
            "success",
            t("form.success.login_successfull"),
            true,
            2000,
          );
          console.log("loggedin", userObj);
          setLoggedUser(userObj);
          navigate("/master", { replace: true });
        }
      })
      .catch((err) => {
        if (err.response) {
          setValue("domainPassword", "");
          if (err.response.status === 400) {
            if (err.response.data && err.response.data.errorTransKey) {
              alertToast.show(
                "warning",
                t(`form.errors.${err.response.data.errorTransKey}`),
                true,
              );
            } else {
              alertToast.show("warning", t("form.errors.invalid_user"), true);
            }
          } else if (err.response.status === 0) {
            alertToast.show(
              "error",
              t("form.errors.api_req_network_error"),
              true,
            );
          } else {
            alertToast.show(
              "warning",
              t("form.errors.api_data_fetching"),
              true,
            );
          }
        } else {
          alertToast.show("error", t("form.errors.defaultError"), true);
        }
      })
      .finally(() => {
        loader.hide();
      });
  };

  useEffect(() => {
    localStorage.removeItem("user-xpandio");
    localStorage.removeItem("loggedin-xpandio");
    sessionStorage.removeItem("persist:root-xpandio");
    setLoginType("Domain");
  }, []);

  return (
    <div className="flex items-center justify-center w-full h-full overflow-hidden ">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-end ">
          <img src={LoginIcon} alt="" className="h-24" />
          <h2 className="text-lg font-bold text-white dark:text-white">
            {t("headings.auth_required")}
          </h2>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit(handleFormSubmit)();
          }}
        >
          <div className="w-[400px] flex flex-col gap-2 shadow-lg rounded-lg pt-6 py-4 px-6  bg-blue-200 bg-opacity-80 dark:bg-opacity-10 border-[1px] border-gray-200 dark:border-gray-700">
            <div className="mb-2 ">
              <TextField
                label={t("form.labels.domain_id")}
                name="domainId"
                control={control}
                className="bg-cyan-50"
              />
            </div>
            <div className="mb-2">
              <TextField
                label={t("form.labels.password")}
                name="domainPassword"
                control={control}
                type="password"
                className="bg-cyan-50"
              />
            </div>
            <button
              type="submit"
              className="w-full px-5 py-2 mt-2 text-sm font-medium text-center text-white rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-2 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800"
              disabled={isSubmitting}
            >
              {t("buttons.sign_in")}
            </button>
            <p className="m-2 text-sm text-center text-cyan-800 dark:text-gray-400">
              {t("form.texts.not_registered_yet")}{" "}
              <button
                type="button"
                className="font-semibold text-blue-600 underline dark:text-blue-500 hover:no-underline"
                onClick={() => {
                  navigate("/auth/scanner-register", { replace: true });
                }}
              >
                {t("buttons.register_user")}
              </button>
            </p>
          </div>
        </form>
      </div>
      <ConfirmBox
        openState={confirmState.status}
        message={confirmState.message}
        handleConfirmCancel={confirmState.handleConfirmCancel}
        handleConfirmOk={confirmState.handleConfirmOk}
        okText="Yes"
        cancelText="No"
        okClass="bg-[#0b7d0b] from-green-700 to-green-500"
        cancelClass="bg-[#de5b5b] "
        messageClass="text-[#d01313]"
      />
    </div>
  );
}

export default DomainLogin;
