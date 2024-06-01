import React, { useEffect, useState } from "react";
import { shallowEqual } from "react-redux";
import { useQueryClient } from "react-query";
import {
  ArrowPathIcon,
  PlusIcon,
  PencilSquareIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import { SubmitHandler, useForm } from "react-hook-form";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppSelector } from "@/store/hooks";
import { Tab, TabContent, TabHeader, TabPanel, Tabs } from "@/features/ui/tabs";
import { IconButton } from "@/features/ui/buttons";
import { useAlertConfig, useLoaderConfig } from "@/features/ui/hooks";
import {
  useConfigDataQuery,
  useConfigDataItemQuery,
} from "@/features/master/hooks";
import { IConfigData, IConfigForm, ILocnList } from "@/features/master/types";
import { AlertInfo, ConfirmBox } from "@/features/ui/alerts";
import ModalPopup from "@/features/ui/popup";
import { DropdownList, TextField } from "@/features/ui/form";
import {
  addConfigItemData,
  updateConfigItemData,
} from "@/features/master/services/common.services";
import { Select } from "@/features/ui/elements";
import IConfigItemData from "@/features/master/types/IConfigItemData";

interface ISDTConfigData {
  ConfigData: IConfigData[];
  LocnList: ILocnList[];
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
    label: "Name",
    minWidth: "min-w-[100px]",
    dbCol: "NAME",
  },
  {
    label: "Short Name",
    minWidth: "min-w-[100px]",
    dbCol: "SHT_NAME",
  },
  {
    label: "Staus",
    minWidth: "min-w-[100px]",
    dbCol: "STATUS",
  },
  {
    label: "Last Updated By",
    minWidth: "min-w-[200px]",
    dbCol: "UPDATED_BY",
  },
  {
    label: "Last Updated Date",
    minWidth: "min-w-[100px]",
    dbCol: "UPDATED_DATE",
  },
];
interface ISDTConfigItemData {
  ConfigItemData: IConfigItemData[];
}
const initialFormValues: IConfigForm = {
  SLNO: 0,
  MAS_ID: 0,
  NAME: "",
  SHT_NAME: "",
  STATUS: "Active",
  LOCN: 0,
};
const formSchema = Yup.object().shape({
  NAME: Yup.string()
    .required("Item Name is required")
    .max(50, "Maximum 50 characters can be entered"),
  SHT_NAME: Yup.string().required("Short Name is required"),
  STATUS: Yup.string().required("Status is required"),
});

function Config() {
  const { t } = useTranslation(["common"]);
  const alertToast = useAlertConfig();
  const queryClient = useQueryClient();
  const loader = useLoaderConfig();
  const [activeIndex, setActiveIndex] = useState(1);
  const [configsData, setConfigsData] = useState<ISDTConfigData>({
    ConfigData: [],
    LocnList: [],
  });
  const [configsItemData, setConfigsItemData] = useState<ISDTConfigItemData>({
    ConfigItemData: [],
  });

  const [item, setItem] = useState<number>(0);

  const globalState = useAppSelector(({ global }) => global, shallowEqual);
  const authState = useAppSelector(({ auth }) => auth, shallowEqual);
  const appModePaddingClass =
    globalState.appMode === "FullScreen" ? "p-0 px-2.5 " : " p-2.5  pb-0 ";

  const [showAddDialog, setShowAddDialog] = useState({
    type: "Add",
    status: false,
    formInitialValues: initialFormValues,
  });

  const { handleSubmit, reset, formState, control, setValue } =
    useForm<IConfigForm>({
      defaultValues: initialFormValues,
      resolver: yupResolver(formSchema),
    });
  const { isDirty, submitCount, errors } = formState;
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

  const handleConfirmOk = () => {
    setConfirmState((oldState) => ({
      ...oldState,
      status: false,
      value: "ok",
    }));
    reset({ ...showAddDialog.formInitialValues });
    setShowAddDialog((oldState) => ({ ...oldState, status: false }));
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
  const handleRefresh = () => {
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] === "configDataQuery",
    });
  };
  const handleReset = () => {
    reset({
      ...initialFormValues,
    });
  };
  const handleAddIteam = () => {
    handleReset();
    setShowAddDialog({
      type: "Add",
      status: true,
      formInitialValues: {
        ...showAddDialog.formInitialValues,
        MAS_ID: item,
      },
    });
  };
  const isEditAllowed =
    authState.ROLES.includes(2) || authState.ROLES.includes(10);

  const isSuperUser =
    authState.ROLES &&
    authState.ROLES.length > 0 &&
    authState.ROLES.includes(2);

  const changeActiveTab = (newIndex: number) => {
    setActiveIndex(newIndex);
  };

  const {
    data: configData,
    isLoading: isConfigDataLoading,
    isError: isConfigDataError,
  } = useConfigDataQuery();
  useEffect(() => {
    if (isConfigDataLoading) {
      loader.show();
    } else {
      loader.hide();
    }
    if (!isConfigDataLoading && isConfigDataError) {
      alertToast.show("error", "Error Reading API", true);
    }
    if (!isConfigDataLoading && !isConfigDataError && configData) {
      const ConfigData = [...configData.ConfigData];
      const LocnList = [...configData.LocnList];
      setConfigsData({
        ConfigData,
        LocnList,
      });
    }
  }, [configData, isConfigDataLoading, isConfigDataError, globalState]);

  const {
    data: configItemData,
    isLoading: isConfigItemDataLoading,
    isError: isConfigItemDataError,
  } = useConfigDataItemQuery(item);

  useEffect(() => {
    if (isConfigItemDataLoading) {
      loader.show();
    } else {
      loader.hide();
    }
    if (!isConfigItemDataLoading && isConfigItemDataError) {
      alertToast.show("error", "Error Reading API", true);
    }
    if (!isConfigItemDataLoading && !isConfigItemDataError && configItemData) {
      const ConfigItemData = [...configItemData.ConfigItemData];
      setConfigsItemData({
        ConfigItemData,
      });
    }
  }, [
    configItemData,
    isConfigItemDataLoading,
    isConfigItemDataError,
    globalState,
  ]);

  const handleEditItem = (row: IConfigData) => {
    reset({
      ...showAddDialog.formInitialValues,
      SLNO: row.ID,
      NAME: row.NAME,
      SHT_NAME: row.SHT_NAME,
      STATUS: row.STATUS,
      LOCN: row.LOCN,
      MAS_ID: row.ID,
    });
    setShowAddDialog({
      type: "Edit",
      status: true,
      formInitialValues: {
        ...showAddDialog.formInitialValues,
        SLNO: row.ID,
        NAME: row.NAME,
        SHT_NAME: row.SHT_NAME,
        STATUS: row.STATUS,
        LOCN: row.LOCN,
        MAS_ID: row.ID,
      },
    });
  };
  const renderEditControl = (row: IConfigData) => {
    if ((isEditAllowed && isSuperUser) || (isEditAllowed && !isSuperUser)) {
      return (
        <IconButton
          onClick={() => {
            handleEditItem(row);
          }}
        >
          <PencilSquareIcon className="h-4 w-4" />
        </IconButton>
      );
    }

    return <span>&nbsp;</span>;
  };
  const handleFormSubmit: SubmitHandler<IConfigForm> = (values) => {
    loader.show();
    if (showAddDialog.type === "Add") {
      addConfigItemData(values)
        .then(() => {
          alertToast.show("success", "Data added Succesfully", true, 2000);
          handleRefresh();
          setShowAddDialog((oldState) => ({ ...oldState, status: false }));
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
    } else if (showAddDialog.type === "Edit") {
      updateConfigItemData(values)
        .then(() => {
          alertToast.show("success", "Data added Succesfully", true, 2000);
          handleRefresh();
          setShowAddDialog((oldState) => ({ ...oldState, status: false }));
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
  return (
    <div
      className={`relative w-full h-full grid grid-rows-[auto_1fr_auto] gap-2.5 overflow-auto ${appModePaddingClass} `}
    >
      <div className="h-[50px] flex justify-between items-center p-1.5 px-2.5 border-[1px] text-md font-semibold text-center bg-[#f0f8ff] rounded-lg shadow-md dark:bg-gray-600 dark:text-cyan-200 dark:border-gray-500">
        <div className="w-[200px] flex justify-start items-center gap-2">
          {activeIndex === 2 && (
            <div className="w-[200px] flex justify-end items-center gap-4">
              <Select
                value={item}
                onChange={(e) => {
                  setItem(+e.target.value);
                  setValue("MAS_ID", +e.target.value, { shouldValidate: true });
                }}
                size="sm"
                className="bg-transparent"
              >
                {configsData.ConfigData.map((items) => (
                  <option key={items.ID} value={items.ID}>
                    {items.NAME}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>
        <div className="w-[200px] flex justify-end items-center gap-4">
          <IconButton onClick={handleAddIteam}>
            <PlusIcon className="w-4 h-4" />
          </IconButton>
          <IconButton onClick={handleRefresh}>
            <ArrowPathIcon className="w-4 h-4" />
          </IconButton>
        </div>
      </div>
      <div className="h-full overflow-auto border-[1px] dark:border-gray-700">
        <Tabs>
          <TabHeader>
            <Tab
              isActive={activeIndex === 1}
              changeHandler={() => {
                changeActiveTab(1);
                handleRefresh();
              }}
            >
              <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />
              Item
            </Tab>
            <Tab
              isActive={activeIndex === 2}
              changeHandler={() => {
                changeActiveTab(2);
                setItem(1);
                handleRefresh();
              }}
            >
              <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />
              Sub-Item
            </Tab>
          </TabHeader>
          <TabContent>
            {activeIndex === 1 && (
              <TabPanel>
                <div className="relative w-full h-full overflow-auto flex flex-col p-2.5 ">
                  {configsData.ConfigData &&
                  configsData.ConfigData.length <= 0 ? (
                    <AlertInfo
                      heading="No Record Found"
                      message="No data found"
                    />
                  ) : (
                    <div className="h-full overflow-auto border-[1px] dark:border-gray-700">
                      <table className="min-w-[99.9%] text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
                            {tableColumns.map((col) => (
                              <th
                                key={col.dbCol}
                                className={`${col.minWidth} py-3 px-6 bg-gray-50 dark:bg-gray-700 `}
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {configsData.ConfigData.map((row) => (
                            <tr
                              key={`${row.ID}`}
                              className="border-[1px] bg-white dark:bg-gray-800 dark:border-gray-700"
                            >
                              {tableColumns.map((col) => (
                                <td
                                  key={`${row.ID}_${col.dbCol}`}
                                  className="px-6 py-4 font-normal text-cyan-700 whitespace-nowrap dark:text-white  "
                                >
                                  {col.label === "Action"
                                    ? renderEditControl(row)
                                    : row[col.dbCol as keyof IConfigData]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabPanel>
            )}
            {activeIndex === 2 && (
              <TabPanel>
                <div className="relative w-full h-full overflow-auto flex flex-col p-2.5 ">
                  {configsItemData.ConfigItemData &&
                  configsItemData.ConfigItemData.length <= 0 ? (
                    <AlertInfo
                      heading="No Record Found"
                      message="No data found"
                    />
                  ) : (
                    <div className="h-full overflow-auto border-[1px] dark:border-gray-700">
                      <table className="min-w-[99.9%] text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
                            {tableColumns.map((col) => (
                              <th
                                key={col.dbCol}
                                className={`${col.minWidth} py-3 px-6 bg-gray-50 dark:bg-gray-700 `}
                              >
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {configsItemData.ConfigItemData.map((row) => (
                            <tr
                              key={`${row.ID}`}
                              className="border-[1px] bg-white dark:bg-gray-800 dark:border-gray-700"
                            >
                              {tableColumns.map((col) => (
                                <td
                                  key={`${row.ID}_${col.dbCol}`}
                                  className="px-6 py-4 font-normal text-cyan-700 whitespace-nowrap dark:text-white  "
                                >
                                  {col.label === "Action"
                                    ? renderEditControl(row)
                                    : row[col.dbCol as keyof IConfigData]}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabPanel>
            )}
          </TabContent>
        </Tabs>
      </div>
      <ModalPopup
        heading={activeIndex === 1 ? "Add New Item" : "Add New SubItem"}
        onClose={handleDialogClose}
        openStatus={showAddDialog.status}
        hasSubmit
        onReset={() => {
          handleReset();
        }}
        hasReset
        onSubmit={() => {
          handleSubmit(handleFormSubmit)();
        }}
        size="medium"
        showError
        hasError={!(Object.keys(errors).length === 0) && submitCount > 0}
      >
        <form className="bg-[#ecf3f9] dark:bg-gray-600">
          <div className="flex flex-wrap justify-evenly items-center p-2.5">
            <div className="basis-full md:basis-1/2 p-2">
              <TextField name="NAME" label="Name" control={control} />
            </div>
            <div className="basis-full md:basis-1/2 p-2">
              <TextField name="SHT_NAME" label="Short Name" control={control} />
            </div>
            <div className="basis-full md:basis-1/2 p-2">
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
            <div className="basis-full md:basis-1/2 p-2">
              <DropdownList
                name="LOCN"
                label="Locations"
                control={control}
                optionList={configsData.LocnList.map((location, index) => ({
                  key: index,
                  id: location.LOCN_ID,
                  name: location.NAME,
                }))}
              />
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
export default Config;
