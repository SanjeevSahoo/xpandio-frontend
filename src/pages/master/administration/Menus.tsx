import React, { useEffect, useState } from "react";
import { shallowEqual } from "react-redux";
import {
  PlusIcon,
  ArrowPathIcon,
  ClipboardDocumentCheckIcon,
  PlusCircleIcon,
  PencilSquareIcon,
  MinusCircleIcon,
} from "@heroicons/react/24/outline";
import * as Yup from "yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { useQueryClient } from "react-query";
import { yupResolver } from "@hookform/resolvers/yup";
import { t } from "i18next";
import { DropdownList, TextField } from "@/features/ui/form";
import { useAppSelector } from "@/store/hooks";
import { IconButton } from "@/features/ui/buttons";
import { Tabs, TabHeader, Tab, TabContent, TabPanel } from "@/features/ui/tabs";
import { AlertInfo, ConfirmBox } from "@/features/ui/alerts";
import { useAlertConfig, useLoaderConfig } from "@/features/ui/hooks";
import ModalPopup from "@/features/ui/popup";
import {
  IAddMenuForm,
  IAddRoleForm,
  IMenuList,
  IAppsList,
  IMenuAccessList,
} from "@/features/master/types";
import IRoleList from "@/features/master/types/IRoleList";
import useRoleListDataQuery from "@/features/master/hooks/useRoleListDataQuery";
import { Select } from "@/features/ui/elements";
import {
  useMenuAccessListQuery,
  useMenuListDataQuery,
} from "@/features/master/hooks";
import {
  MenuAccessUpdate,
  addMenus,
  addRoles,
  updateMenus,
  updateRoles,
} from "@/features/master/services/common.services";
import useAppListDataQuery from "@/features/master/hooks/useAppListDataQuery";

const initialFormValues: IAddMenuForm = {
  Id: 0,
  MAS_ID: 0,
  APP_ID: 0,
  NAME: "",
  STATUS: "Active",
};
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
    label: "Status",
    minWidth: "min-w-[100px]",
    dbCol: "STATUS",
  },
  {
    label: "Updated By",
    minWidth: "min-w-[100px]",
    dbCol: "UPD_BY",
  },
  {
    label: "Updated By",
    minWidth: "min-w-[100px]",
    dbCol: "UPD_TS",
  },
];

const tableColumnsRoles = [
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
    label: "Menu Name",
    minWidth: "min-w-[100px]",
    dbCol: "NAME",
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

const initialRoleCreationFormValues: IAddRoleForm = {
  Id: 0,
  NAME: "",
  STATUS: "Active",
};

const formSchema = Yup.object().shape({
  NAME: Yup.string()
    .required("Menu Name is required")
    .max(50, "Maximum 50 characters can be entered"),
  STATUS: Yup.string().required("Status is required"),
});
const MenuTableColumns = [
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
    minWidth: "min-w-[80px]",
    dbCol: "NAME",
  },
  {
    label: "Status",
    minWidth: "min-w-[100px]",
    dbCol: "STATUS",
  },
];
interface ISDTRoleData {
  RolesList: IRoleList[];
}

interface ISDTAppData {
  AppsList: IAppsList[];
}
interface ISDTMenuData {
  MenusList: IMenuList[];
}
interface ISDTMenuAccessData {
  MenuAccessList: IMenuAccessList[];
}
function Menus() {
  const loader = useLoaderConfig();
  const queryClient = useQueryClient();
  const alertToast = useAlertConfig();
  const globalState = useAppSelector(({ global }) => global, shallowEqual);
  const [activeIndex, setActiveIndex] = useState(1);
  const [openArray, setOpenArray] = useState<number[]>([]);
  const [id, setId] = useState<number[]>([]);

  const appModePaddingClass =
    globalState.appMode === "FullScreen" ? "p-0 px-2.5 " : " p-2.5  pb-0 ";
  const changeActiveTab = (newIndex: number) => {
    setActiveIndex(newIndex);
  };
  const [showAddDialog, setShowAddDialog] = useState({
    type: "Add",
    status: false,
    formInitialValues: initialFormValues,
  });

  const [showRoleCreationDialog, setShowRoleCreationDialog] = useState({
    type: "Add",
    status: false,
    formRoleInitialValues: initialRoleCreationFormValues,
  });

  const [roleList, setRoleListData] = useState<ISDTRoleData>({
    RolesList: [],
  });
  const [menuList, setMenuListData] = useState<ISDTMenuData>({
    MenusList: [],
  });
  const [masId, setMasId] = useState<number>(0);
  const [appList, setAppListData] = useState<ISDTAppData>({
    AppsList: [],
  });
  const [menuAccess, setMenuAccess] = useState<ISDTMenuAccessData>({
    MenuAccessList: [],
  });
  const [menuAccessDataUpdate, setMenuAccessDataUpdate] = useState<string[]>(
    [],
  );
  const [role, setRole] = useState<number>(1);
  const [app, setApp] = useState<number>(1);

  const {
    data: menuAccessList,
    isLoading: isMenuAccessListLoading,
    isError: isMenuAccessListError,
  } = useMenuAccessListQuery(role);

  useEffect(() => {
    if (isMenuAccessListLoading) {
      loader.show();
    } else {
      loader.hide();
    }
    if (!isMenuAccessListLoading && isMenuAccessListError) {
      alertToast.show("error", "Error Reading API", true);
    }
    if (!isMenuAccessListLoading && !isMenuAccessListError && menuAccessList) {
      const MenuAccessList = [...menuAccessList.MenusAccessList];

      setMenuAccess({
        MenuAccessList,
      });

      let arr: string[] = [];
      let arrMenuAccess: string[] = [];

      MenuAccessList.forEach((menu) => {
        arrMenuAccess = menu.MENU_ID.split(",");
      });
      arr = [...arrMenuAccess];

      setMenuAccessDataUpdate(arr);
    }
  }, [menuAccessList, isMenuAccessListLoading, isMenuAccessListError]);
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

  const {
    data: roleListData,
    isLoading: isRoleListDataLoading,
    isError: isRoleListDataError,
  } = useRoleListDataQuery();

  useEffect(() => {
    if (isRoleListDataLoading) {
      loader.show();
    } else {
      loader.hide();
    }
    if (!isRoleListDataLoading && isRoleListDataError) {
      alertToast.show("error", "Error Reading API", true);
    }
    if (!isRoleListDataLoading && !isRoleListDataError && roleListData) {
      const RolesList = [...roleListData.RolesList];

      setRoleListData({
        RolesList,
      });
    }
  }, [roleListData, isRoleListDataLoading, isRoleListDataError]);

  const {
    data: menuListData,
    isLoading: isMenuListDataLoading,
    isError: isMenuListDataError,
  } = useMenuListDataQuery(app);

  useEffect(() => {
    if (isMenuListDataLoading) {
      loader.show();
    } else {
      loader.hide();
    }
    if (!isMenuListDataLoading && isMenuListDataError) {
      alertToast.show("error", "Error Reading API", true);
    }
    if (!isMenuListDataLoading && !isMenuListDataError && menuListData) {
      const MenusList = [...menuListData.MenusList];
      const arr = [...MenusList];
      const arr2: number[] = [];
      arr.map((menu) => arr2.push(menu.MAS_ID));
      setId(arr2);
      setMenuListData({
        MenusList,
      });
    }
  }, [menuListData, isMenuListDataLoading, isMenuListDataError]);

  const { handleSubmit, reset, formState, control } = useForm<IAddMenuForm>({
    defaultValues: initialFormValues,
    resolver: yupResolver(formSchema),
  });

  const {
    handleSubmit: handleSubmitRoleCreation,
    reset: resetRoleCreation,
    control: controlRoleCreation,
    formState: formStateRoleCreation,
  } = useForm<IAddRoleForm>({
    defaultValues: initialRoleCreationFormValues,
  });

  const { isDirty, submitCount, errors } = formState;

  const {
    isDirty: isDirtyRole,
    submitCount: submitCountRole,
    errors: errorsRole,
  } = formStateRoleCreation;

  const [confirmStateRole, setConfirmStateRole] = useState({
    status: false,
    value: "cancel",
    message: "",
    handleConfirmRoleOk: () => {},
    handleConfirmRoleCancel: () => {},
  });

  const [confirmState, setConfirmState] = useState({
    status: false,
    value: "cancel",
    message: "",
    handleConfirmOk: () => {},
    handleConfirmCancel: () => {},
  });

  const handleReset = () => {
    reset({
      ...initialFormValues,
      MAS_ID: masId,
      APP_ID: app,
    });
  };
  const handleResetRole = () => {
    resetRoleCreation({
      ...initialRoleCreationFormValues,
    });
  };
  const handleAddMenus = () => {
    if (activeIndex === 1) {
      handleReset();
      setShowAddDialog({
        type: "Add",
        status: true,
        formInitialValues: {
          ...showAddDialog.formInitialValues,
          MAS_ID: masId,
          APP_ID: app,
        },
      });
    } else if (activeIndex === 2) {
      handleResetRole();
      setShowRoleCreationDialog({
        type: "Add",
        status: true,
        formRoleInitialValues: {
          ...showRoleCreationDialog.formRoleInitialValues,
        },
      });
    }
  };

  const handleRefresh = () => {
    if (activeIndex === 1 || activeIndex === 3) {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "menuListDataQuery",
      });
    }
    if (activeIndex === 2) {
      queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "roleListDataQuery",
      });
    }
  };

  const subMenu = (ID: number) => {
    return menuList.MenusList.map((data) => (
      <div className="ml-10">
        <ul className="list-none menu-list">
          {ID === data.MAS_ID && openArray.includes(data.MAS_ID) && (
            <button
              type="button"
              onClick={() => {
                setMasId(data.ID);
              }}
            >
              <li key={data.ID}>{data.NAME}</li>
            </button>
          )}
        </ul>
      </div>
    ));
  };
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

  const handleConfirmRoleCancel = () => {
    setConfirmStateRole((oldState) => ({
      ...oldState,
      status: false,
      value: "cancel",
    }));
  };

  const handleConfirmRoleOk = () => {
    setConfirmStateRole((oldState) => ({
      ...oldState,
      status: false,
      value: "ok",
    }));
    resetRoleCreation({ ...showRoleCreationDialog.formRoleInitialValues });
    setShowRoleCreationDialog((oldState) => ({ ...oldState, status: false }));
  };

  const handleRoleCreationDialogClose = () => {
    if (isDirtyRole) {
      setConfirmStateRole({
        status: true,
        value: "cancel",
        message:
          "Some unsaved Data in Form. Data will be lost if closed. Confirm Close?",
        handleConfirmRoleCancel,
        handleConfirmRoleOk,
      });
    } else {
      setShowRoleCreationDialog((oldState) => ({ ...oldState, status: false }));
    }
  };

  const handleEditRole = (row: IRoleList) => {
    resetRoleCreation({
      ...showRoleCreationDialog.formRoleInitialValues,
      Id: row.ID,
      NAME: row.NAME,
      STATUS: row.STATUS,
    });
    setShowRoleCreationDialog({
      type: "Update",
      status: true,
      formRoleInitialValues: {
        ...showRoleCreationDialog.formRoleInitialValues,
        Id: row.ID,
        NAME: row.NAME,
        STATUS: row.STATUS,
      },
    });
  };

  const handleEditMenu = (row: IMenuList) => {
    reset({
      ...showAddDialog.formInitialValues,
      Id: row.ID,
      NAME: row.NAME,
      STATUS: row.STATUS,
      APP_ID: app,
    });
    setShowAddDialog({
      type: "Update",
      status: true,
      formInitialValues: {
        ...showAddDialog.formInitialValues,
        Id: row.ID,
        NAME: row.NAME,
        STATUS: row.STATUS,
        APP_ID: app,
      },
    });
  };

  const renderEditControlRole = (row: IRoleList) => {
    return (
      <IconButton
        onClick={() => {
          handleEditRole(row);
        }}
      >
        <PencilSquareIcon className="w-4 h-4" />
      </IconButton>
    );
  };
  const renderEditControlMenu = (row: IMenuList) => {
    return (
      <IconButton
        onClick={() => {
          handleEditMenu(row);
        }}
      >
        <PencilSquareIcon className="w-4 h-4" />
      </IconButton>
    );
  };
  const handleRoleCreationFormSubmit: SubmitHandler<IAddRoleForm> = (
    values,
  ) => {
    if (showRoleCreationDialog.type === "Add") {
      addRoles(values)
        .then(() => {
          alertToast.show("success", "Data Added Succesfully", true, 2000);
          handleRefresh();
          handleResetRole();
          setShowRoleCreationDialog((oldState) => ({
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
    } else if (showRoleCreationDialog.type === "Update") {
      updateRoles(values)
        .then(() => {
          alertToast.show("success", "Data Updated Succesfully", true, 2000);
          handleRefresh();
          handleResetRole();
          setShowRoleCreationDialog((oldState) => ({
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

  const handleFormSubmit: SubmitHandler<IAddMenuForm> = (values) => {
    if (showAddDialog.type === "Add") {
      addMenus(values)
        .then(() => {
          alertToast.show("success", "Data Added Succesfully", true, 2000);
          handleRefresh();
          handleReset();
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
      updateMenus(values)
        .then(() => {
          alertToast.show("success", "Data Updated Succesfully", true, 2000);
          handleRefresh();
          handleReset();
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
  const getMenuAccessStatus = (Id: string) => {
    let flag = false;

    menuAccessDataUpdate.forEach((menu) => {
      if (menu === Id) {
        flag = true;
      }
    });
    return flag;
  };
  const updateMenuAccess = () => {
    MenuAccessUpdate(menuAccessDataUpdate, role).then((response) => {
      if (response.status === 200) {
        queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === "menuAccessListDataQuery",
        });
        alertToast.show("success", "Updated Successfully", true);
      }
    });
  };
  const handleMenu = (ID: number) => {
    setMasId(ID);
    if (!openArray.includes(ID)) {
      setOpenArray([...openArray, ID]);
    } else {
      const arr = [...openArray];
      const index = arr.indexOf(ID);
      if (index > -1) {
        arr.splice(index, 1);
        setOpenArray(arr);
      }
    }
  };
  const renderMenu = (
    row: IMenuList,
    col: { label: string; minWidth?: string; dbCol: string },
  ) => {
    if (col.label === "Action") {
      return renderEditControlMenu(row);
    }
    return row[col.dbCol as keyof IMenuList].toString();
  };

  return (
    <div
      className={`relative w-full h-full grid grid-rows-[auto_1fr_auto] gap-2.5 overflow-auto ${appModePaddingClass} `}
    >
      <div className="h-[50px] flex justify-between items-center p-1.5 px-2.5 border-[1px] text-md font-semibold text-center bg-[#f0f8ff] rounded-lg shadow-md dark:bg-gray-600 dark:text-cyan-200 dark:border-gray-500">
        <div className="w-[500px] flex justify-start items-center gap-2">
          {activeIndex === 3 && (
            <div className="w-[200px] flex justify-end items-center gap-4">
              <Select
                value={role}
                onChange={(e) => {
                  setRole(+e.target.value);
                }}
                size="sm"
                className="bg-transparent"
              >
                {roleList.RolesList.map((item) => (
                  <option key={item.ID} value={item.ID}>
                    {item.NAME}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {(activeIndex === 1 || activeIndex === 3) && (
            <div className="w-[200px] flex justify-end items-center gap-4">
              <Select
                value={app}
                onChange={(e) => {
                  setApp(+e.target.value);
                  setMasId(0);
                }}
                size="sm"
                className="bg-transparent"
              >
                {appList.AppsList.map((item) => (
                  <option key={item.ID} value={item.ID}>
                    {item.NAME}
                  </option>
                ))}
              </Select>
            </div>
          )}
        </div>
        <div className="w-[200px] flex justify-end items-center gap-4">
          {(activeIndex === 1 || activeIndex === 2) && (
            <IconButton onClick={handleAddMenus}>
              <PlusIcon className="w-4 h-4" />
            </IconButton>
          )}
          {activeIndex === 3 && (
            <button
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2 mt-2 text-sm font-medium text-center text-blue-900 bg-opacity-50 rounded-lg focus:ring-2 focus:outline-none focus:ring-blue-300 dark:focus:ring-gray-300 bg-cyan-400 hover:bg-gray-400 dark:bg-cyan-500 dark:text-blue-900 dark:hover:bg-gray-400"
              onClick={updateMenuAccess}
            >
              Submit
            </button>
          )}
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
              }}
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Menus Creation
            </Tab>
            <Tab
              isActive={activeIndex === 2}
              changeHandler={() => {
                changeActiveTab(2);
              }}
            >
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Role Creation
            </Tab>
            <Tab
              isActive={activeIndex === 3}
              changeHandler={() => {
                changeActiveTab(3);
              }}
            >
              <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />
              Menus Access
            </Tab>
          </TabHeader>
          <TabContent>
            {activeIndex === 1 && (
              <div className="h-full grid grid-cols-[2fr_2fr] ">
                <div className=" h-full overflow-auto border-[2px]">
                  {menuList.MenusList.map((row) => (
                    <div className="flex justify-between w-full ml-3 item-center">
                      <ul className="pl-3 list-none menu-list">
                        {row.MAS_ID === 0 && row.APP_ID === app && (
                          <li key={row.ID}>
                            <span className="flex">
                              {" "}
                              {openArray.includes(row.ID) &&
                                id.includes(row.ID) && (
                                  <MinusCircleIcon className="w-5 h-5 mt-1" />
                                )}
                              {!openArray.includes(row.ID) &&
                                id.includes(row.ID) && (
                                  <PlusCircleIcon className="w-5 h-5 mt-1" />
                                )}
                              <button
                                type="button"
                                className="flex items-center justify-between"
                                onClick={() => {
                                  handleMenu(row.ID);
                                }}
                              >
                                {row.NAME}
                              </button>
                            </span>{" "}
                            {subMenu(row.ID)}
                          </li>
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 overflow-auto">
                  {masId ? (
                    <table className="min-w-[99.9%] h-[10px] text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          {MenuTableColumns.map((col) => (
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
                        {menuList.MenusList.map(
                          (row) =>
                            masId === row.MAS_ID && (
                              <tr
                                key={`${row.ID}`}
                                className="border-[1px] bg-white dark:bg-gray-800 dark:border-gray-700"
                              >
                                {MenuTableColumns.map((col) => (
                                  <td
                                    key={`${row.ID}_${col.dbCol}`}
                                    className="px-6 py-4 font-normal text-cyan-700 whitespace-nowrap dark:text-white "
                                  >
                                    {renderMenu(row, col)}
                                  </td>
                                ))}
                              </tr>
                            ),
                        )}
                      </tbody>
                    </table>
                  ) : (
                    <table className="min-w-[99.9%] h-[10px] text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          {MenuTableColumns.map((col) => (
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
                        {menuList.MenusList.map(
                          (row) =>
                            row.MAS_ID === 0 &&
                            row.APP_ID === app && (
                              <tr
                                key={`${row.ID}`}
                                className="border-[1px] bg-white dark:bg-gray-800 dark:border-gray-700"
                              >
                                {MenuTableColumns.map((col) => (
                                  <td
                                    key={`${row.ID}_${col.dbCol}`}
                                    className="px-6 py-4 font-normal text-cyan-700 whitespace-nowrap dark:text-white "
                                  >
                                    {renderMenu(row, col)}
                                  </td>
                                ))}
                              </tr>
                            ),
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
            {activeIndex === 3 && (
              <TabPanel>
                <div className="relative w-full h-full overflow-auto flex flex-col p-2.5 ">
                  {menuList.MenusList && menuList.MenusList.length <= 0 ? (
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
                          {menuList.MenusList.map((row) => (
                            <tr
                              key={`${row.ID}`}
                              className="border-[1px] bg-white dark:bg-gray-800 dark:border-gray-700"
                            >
                              {tableColumns.map((col) => (
                                <td
                                  key={`${row.ID}_${col.dbCol}`}
                                  className="px-6 py-4 font-normal text-cyan-700 whitespace-nowrap dark:text-white "
                                >
                                  {col.label === "Action" ? (
                                    <input
                                      id={row.ID.toString()}
                                      type="checkbox"
                                      checked={getMenuAccessStatus(
                                        row.ID.toString(),
                                      )}
                                      onChange={(event) => {
                                        const arr: string[] = [];
                                        if (event.target.checked) {
                                          arr.push(
                                            ...menuAccessDataUpdate,
                                            row.ID.toString(),
                                          );
                                          setMenuAccessDataUpdate(arr);
                                        } else {
                                          const arr2 = [
                                            ...menuAccessDataUpdate,
                                          ];
                                          const index = arr2
                                            .map((x) => {
                                              return x;
                                            })
                                            .indexOf(row.ID.toString());
                                          arr2.splice(index, 1);
                                          setMenuAccessDataUpdate(arr2);
                                        }
                                      }}
                                      name="1"
                                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                  ) : (
                                    ""
                                  )}
                                  {row[col.dbCol as keyof IMenuList]}
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
                  {roleList.RolesList && roleList.RolesList.length <= 0 ? (
                    <AlertInfo
                      heading="No Record Found"
                      message="No data found"
                    />
                  ) : (
                    <div className="h-full overflow-auto border-[1px] dark:border-gray-700">
                      <table className="min-w-[99.9%] text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                          <tr>
                            {tableColumnsRoles.map((col) => (
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
                          {roleList.RolesList.map((row) => (
                            <tr
                              key={`${row.ID}`}
                              className="border-[1px] bg-white dark:bg-gray-800 dark:border-gray-700"
                            >
                              {tableColumnsRoles.map((col) => (
                                <td
                                  key={`${row.ID}_${col.dbCol}`}
                                  className="px-6 py-4 font-normal text-cyan-700 whitespace-nowrap dark:text-white "
                                >
                                  {col.label === "Action"
                                    ? renderEditControlRole(row)
                                    : row[col.dbCol as keyof IRoleList]}
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
        heading={showAddDialog.type === "Add" ? "Create Menu" : "Menu Update"}
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
            <div className="p-2 basis-full md:basis-1/2">
              <TextField name="NAME" label="Menu Name" control={control} />
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
            <div className="p-2 basis-full md:basis-1/2" />
          </div>
        </form>
      </ModalPopup>
      <ConfirmBox
        openState={confirmState.status}
        message={confirmState.message}
        handleConfirmCancel={confirmState.handleConfirmCancel}
        handleConfirmOk={confirmState.handleConfirmOk}
      />
      <ModalPopup
        heading={
          showRoleCreationDialog.type === "Add" ? "Create Role" : "Update Role"
        }
        onClose={handleRoleCreationDialogClose}
        openStatus={showRoleCreationDialog.status}
        hasSubmit
        onSubmit={() => {
          handleSubmitRoleCreation(handleRoleCreationFormSubmit)();
        }}
        size="medium"
        showError
        hasError={
          !(Object.keys(errorsRole).length === 0) && submitCountRole > 0
        }
      >
        <form className="bg-[#ecf3f9] dark:bg-gray-600">
          <div className="flex flex-wrap justify-evenly items-center p-2.5">
            <div className="p-2 basis-full md:basis-1/2">
              <TextField
                name="NAME"
                label="Role Name"
                control={controlRoleCreation}
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
                control={controlRoleCreation}
              />
            </div>
            <div className="p-2 basis-full md:basis-1/2" />
          </div>
        </form>
      </ModalPopup>
      <ConfirmBox
        openState={confirmStateRole.status}
        message={confirmStateRole.message}
        handleConfirmCancel={confirmStateRole.handleConfirmRoleCancel}
        handleConfirmOk={confirmStateRole.handleConfirmRoleOk}
      />
    </div>
  );
}
export default Menus;
