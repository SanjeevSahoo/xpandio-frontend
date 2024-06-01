import React, { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import { t } from "i18next";
import { shallowEqual } from "react-redux";
import {
  PlusIcon,
  ArrowPathIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQueryClient } from "react-query";
import { useAppSelector } from "@/store/hooks";
import { IAddAppForm, IAppsList } from "@/features/master/types";
import { useAlertConfig, useLoaderConfig } from "@/features/ui/hooks";
import useAppListDataQuery from "@/features/master/hooks/useAppListDataQuery";
import { AlertInfo, ConfirmBox } from "@/features/ui/alerts";
import { IconButton } from "@/features/ui/buttons";
import ModalPopup from "@/features/ui/popup";
import { DropdownList, TextField } from "@/features/ui/form";
import { API_BASE_URL, ASSET_BASE_URL } from "@/features/common/constants";
import {
  addApps,
  updateApps,
} from "@/features/master/services/common.services";

interface ISDTAppData {
  AppsList: IAppsList[];
}

const tableColumns = [
  {
    label: "Action",
    minWidth: "min-w-[80px]",
    dbCol: "",
  },
  {
    label: "Id",
    minWidth: "min-w-[80px]",
    dbCol: "ID",
  },
  {
    label: "LOGO",
    minWidth: "min-w-[80px]",
    dbCol: "DUMMY",
  },
  {
    label: "Application Name",
    minWidth: "min-w-[100px]",
    dbCol: "NAME",
  },
  {
    label: "Short Name",
    minWidth: "min-w-[100px]",
    dbCol: "SHT_NAME",
  },
  {
    label: "App Description",
    minWidth: "min-w-[100px]",
    dbCol: "APP_DESC",
  },
  {
    label: "Status",
    minWidth: "min-w-[100px]",
    dbCol: "STATUS",
  },
  {
    label: "UPDATED BY",
    minWidth: "min-w-[100px]",
    dbCol: "UPDATED_BY",
  },
  {
    label: "UPDATED DATE",
    minWidth: "min-w-[100px]",
    dbCol: "UPDATED_DATE",
  },
];

const initialFormValues: IAddAppForm = {
  ID: 0,
  NAME: "",
  SHT_NAME: "",
  STATUS: "Active",
  APP_DESC: "",
  LOGO_PATH: "",
};

const formSchema = Yup.object().shape({
  NAME: Yup.string()
    .required("Menu Name is required")
    .max(50, "Maximum 50 characters can be entered"),
  SHT_NAME: Yup.string().required("Menu Name is required"),
  STATUS: Yup.string().required("Status is required"),
  LOGO_PATH: Yup.string().required("Status is required"),
});

function Applications() {
  const loader = useLoaderConfig();
  const alertToast = useAlertConfig();
  const queryClient = useQueryClient();
  const imgRef = useRef<HTMLInputElement>(null);
  const [appList, setAppListData] = useState<ISDTAppData>({
    AppsList: [],
  });
  const globalState = useAppSelector(({ global }) => global, shallowEqual);
  const appModePaddingClass =
    globalState.appMode === "FullScreen" ? "p-0 px-2.5 " : " p-2.5  pb-0 ";

  const [showAddDialog, setShowAddDialog] = useState({
    type: "Add",
    status: false,
    formInitialValues: initialFormValues,
  });
  const [confirmState, setConfirmState] = useState({
    status: false,
    value: "cancel",
    message: "",
    handleConfirmOk: () => {},
    handleConfirmCancel: () => {},
  });

  const {
    data: appListData,
    isLoading: isAppListDataLoading,
    isError: isAppListDataError,
  } = useAppListDataQuery();

  useEffect(() => {
    if (isAppListDataLoading) {
      loader.show();
    } else {
      loader.hide();
    }
    if (!isAppListDataLoading && isAppListDataError) {
      alertToast.show("error", "Error Reading API", true);
    }
    if (!isAppListDataLoading && !isAppListDataError && appListData) {
      const AppsList = [...appListData.AppsList];

      setAppListData({
        AppsList,
      });
    }
  }, [appListData, isAppListDataLoading, isAppListDataError]);

  const { handleSubmit, reset, formState, control, setValue } =
    useForm<IAddAppForm>({
      defaultValues: initialFormValues,
      resolver: yupResolver(formSchema),
    });

  const handleReset = () => {
    reset({
      ...initialFormValues,
    });
  };
  const handleAddApps = () => {
    handleReset();
    setShowAddDialog({
      type: "Add",
      status: true,
      formInitialValues: {
        ...showAddDialog.formInitialValues,
      },
    });
  };

  const { isDirty, submitCount, errors } = formState;

  const handleConfirmCancel = () => {
    setConfirmState((oldState) => ({
      ...oldState,
      status: false,
      value: "cancel",
    }));
  };

  const handleConfirmOk = () => {
    setConfirmState((oldState) => ({
      ...oldState,
      status: false,
      value: "ok",
    }));
    reset({ ...showAddDialog.formInitialValues });
    setShowAddDialog((oldState) => ({ ...oldState, status: false }));
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === "appsDataQuery",
    });
  };

  const handleDialogClose = () => {
    if (isDirty) {
      setConfirmState({
        status: true,
        value: "cancel",
        message:
          "Some unsaved Data in Form. Data will be lost if closed. Confirm Close?",
        handleConfirmCancel,
        handleConfirmOk,
      });
    } else {
      setShowAddDialog((oldState) => ({ ...oldState, status: false }));
    }
  };

  const handleFormSubmit: SubmitHandler<IAddAppForm> = (values) => {
    if (showAddDialog.type === "Add") {
      addApps(values)
        .then(() => {
          alertToast.show("success", "Data Added Succesfully", true, 2000);
          handleRefresh();
          if (imgRef && imgRef.current) {
            imgRef.current.value = "";
          }
          setShowAddDialog((oldState) => ({
            ...oldState,
            status: false,
          }));
        })
        .catch((err) => {
          if (err.response && err.response.status) {
            if (err.response.data && err.response.data.errorTransKey) {
              alertToast.show(
                "warning",
                t(`form.errors.${err.response.data.errorTransKey}`),
                true,
              );
            } else {
              alertToast.show("error", t("form.errors.defaultError"), true);
            }
          }
        })
        .finally(() => {
          loader.hide();
        });
    } else if (showAddDialog.type === "Update") {
      updateApps(values)
        .then(() => {
          alertToast.show("success", "Data updated Succesfully", true, 2000);
          handleRefresh();
          setShowAddDialog((oldState) => ({
            ...oldState,
            status: false,
          }));
        })
        .catch((err) => {
          if (err.response && err.response.status) {
            if (err.response.data && err.response.data.errorTransKey) {
              alertToast.show(
                "warning",
                t(`form.errors.${err.response.data.errorTransKey}`),
                true,
              );
            } else {
              alertToast.show("error", t("form.errors.defaultError"), true);
            }
          }
        })
        .finally(() => {
          loader.hide();
        });
    }
  };
  const handleEditApp = (row: IAppsList) => {
    reset({
      ...showAddDialog.formInitialValues,
      ID: row.ID,
      NAME: row.NAME,
      SHT_NAME: row.SHT_NAME,
      STATUS: row.STATUS,
      LOGO_PATH: row.LOGO_PATH,
      APP_DESC: row.APP_DESC,
    });
    setShowAddDialog({
      type: "Update",
      status: true,
      formInitialValues: {
        ...showAddDialog.formInitialValues,
        ID: row.ID,
        NAME: row.NAME,
        SHT_NAME: row.SHT_NAME,
        STATUS: row.STATUS,
        LOGO_PATH: row.LOGO_PATH,
        APP_DESC: row.APP_DESC,
      },
    });
  };
  const renderEditControl = (row: IAppsList) => {
    return (
      <IconButton
        onClick={() => {
          handleEditApp(row);
        }}
      >
        <PencilSquareIcon className="w-4 h-4" />
      </IconButton>
    );
  };

  const handleLogoFileChange = (e: any) => {
    const formData = new FormData();
    const randomNumber = Math.floor(Math.random() * 100 + 1);
    formData.append("filename", `${randomNumber}_app_logo.JPG`);
    formData.append("file", e.target.files[0]);
    fetch(`${API_BASE_URL}uploadlogo`, {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (res.status === 200) {
          setValue("LOGO_PATH", `${randomNumber}_app_logo.JPG`, {
            shouldValidate: true,
          });
        } else {
          alertToast.show("error", "Error Uploading Image", true);
        }
      })
      .catch(() => {
        alertToast.show("error", "Error Uploading Image", true);
      });
  };

  return (
    <div
      className={`relative w-full h-full grid grid-rows-[auto_1fr_auto] gap-2.5 overflow-auto ${appModePaddingClass} `}
    >
      <div className="h-[50px] flex justify-between items-center p-1.5 px-2.5 border-[1px] text-md font-semibold text-center bg-[#f0f8ff] rounded-lg shadow-md dark:bg-gray-600 dark:text-cyan-200 dark:border-gray-500">
        <div className="w-[200px] flex justify-start items-center gap-2" />
        <div className="w-[200px] flex justify-end items-center gap-4">
          <IconButton onClick={handleAddApps}>
            <PlusIcon className="w-4 h-4" />
          </IconButton>
          <IconButton onClick={handleRefresh}>
            <ArrowPathIcon className="w-4 h-4" />
          </IconButton>
        </div>
      </div>
      <div className="relative w-full h-full overflow-auto flex flex-col p-2.5 ">
        {appList.AppsList && appList.AppsList.length <= 0 ? (
          <AlertInfo heading="No Record Found" message="No data found" />
        ) : (
          <div className="h-full overflow-auto border-[1px] dark:border-gray-700">
            <table className="min-w-[99.9%] text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  {tableColumns.map((col) => (
                    <th
                      key={`head${col.dbCol}`}
                      className={`${col.minWidth} py-3 px-6 bg-gray-50 dark:bg-gray-700 `}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appList.AppsList.map((row) => (
                  <tr
                    key={`${row.ID}`}
                    className="border-[1px] bg-white dark:bg-gray-800 dark:border-gray-700"
                  >
                    {tableColumns.map((col) => (
                      <td
                        key={`${row.ID}_${col.dbCol}`}
                        className="px-6 py-4 font-normal text-cyan-700 whitespace-nowrap dark:text-white "
                      >
                        {col.label === "LOGO" && (
                          <div>
                            <img
                              className="h-[40px] w-[40px] rounded-full"
                              src={`${ASSET_BASE_URL}images/logo/${
                                row.LOGO_PATH ? row.LOGO_PATH : ""
                              }`}
                              alt="logo"
                            />
                          </div>
                        )}
                        {col.label === "Action"
                          ? renderEditControl(row)
                          : row[col.dbCol as keyof IAppsList]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ModalPopup
        heading="App Creation"
        onClose={handleDialogClose}
        openStatus={showAddDialog.status}
        hasSubmit
        hasReset
        onReset={() => {
          handleReset();
        }}
        onSubmit={() => {
          handleSubmit(handleFormSubmit)();
        }}
        size="large"
        showError
        hasError={!(Object.keys(errors).length === 0) && submitCount > 0}
      >
        <form className="bg-[#ecf3f9] dark:bg-gray-600">
          <div className="flex flex-wrap justify-evenly items-center p-2.5">
            <div className="p-2 basis-full md:basis-1/2">
              <TextField name="NAME" label="Name" control={control} />
            </div>
            <div className="p-2 basis-full md:basis-1/2">
              <TextField name="SHT_NAME" label="Short Name" control={control} />
            </div>
            <div className="p-2 basis-full md:basis-2/2">
              <TextField
                name="APP_DESC"
                label="App Description"
                control={control}
              />
            </div>
            <div className="p-2 basis-full md:basis-1/2">
              <DropdownList
                optionList={[
                  { id: "Active", name: "Active" },
                  { id: "InActive", name: "InActive" },
                ]}
                label="Status"
                name="STATUS"
                control={control}
              />
            </div>
            <div className="p-2 basis-full md:basis-1/2">
              <label
                htmlFor="LOGO_PATH"
                className="block text-sm font-normal text-gray-900 dark:text-gray-300"
              >
                Logo Image
                <input
                  className="block text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-black-700 hover:file:bg-violet-100"
                  type="file"
                  name="LOGO_PATH"
                  onChange={handleLogoFileChange}
                  accept="image/jpeg"
                  ref={imgRef}
                />
              </label>
            </div>
          </div>
        </form>
      </ModalPopup>
      <ConfirmBox
        openState={confirmState.status}
        message={confirmState.message}
        handleConfirmCancel={confirmState.handleConfirmCancel}
        handleConfirmOk={confirmState.handleConfirmOk}
      />
    </div>
  );
}

export default Applications;
