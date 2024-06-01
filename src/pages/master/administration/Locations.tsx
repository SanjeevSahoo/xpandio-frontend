import React, { useEffect, useState } from "react";
import { shallowEqual } from "react-redux";
import { useQueryClient } from "react-query";
import * as Yup from "yup";
import {
  PlusIcon,
  ArrowPathIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import { t } from "i18next";
import { useAppSelector } from "@/store/hooks";
import { IAddLocnForm, ILocnList } from "@/features/master/types";
import { useAlertConfig, useLoaderConfig } from "@/features/ui/hooks";
import { useLocnListDataQuery } from "@/features/master/hooks";
import { AlertInfo, ConfirmBox } from "@/features/ui/alerts";
import { IconButton } from "@/features/ui/buttons";
import { DropdownList, TextField } from "@/features/ui/form";
import ModalPopup from "@/features/ui/popup";
import {
  addLocns,
  updateLocns,
} from "@/features/master/services/common.services";

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
    label: "Location Name",
    minWidth: "min-w-[100px]",
    dbCol: "NAME",
  },
  {
    label: "Short Name",
    minWidth: "min-w-[100px]",
    dbCol: "SHT_NAME",
  },
  {
    label: "Status",
    minWidth: "min-w-[100px]",
    dbCol: "STATUS",
  },
  {
    label: "Locn Id",
    minWidth: "min-w-[100px]",
    dbCol: "LOCN_ID",
  },
  {
    label: "Org Id",
    minWidth: "min-w-[100px]",
    dbCol: "ORG_ID",
  },
  {
    label: "Unit Id",
    minWidth: "min-w-[100px]",
    dbCol: "UNIT_ID",
  },
];

interface ISDTLocationData {
  LocationsList: ILocnList[];
}
const initialFormValues: IAddLocnForm = {
  ID: 0,
  NAME: "",
  SHT_NAME: "",
  STATUS: "Active",
  LOCN_ID: 0,
  ORG_ID: 0,
  UNIT_ID: 0,
};
const formSchema = Yup.object().shape({
  NAME: Yup.string()
    .required("Menu Name is required")
    .max(50, "Maximum 50 characters can be entered"),
  SHT_NAME: Yup.string().required("Menu Name is required"),
  STATUS: Yup.string().required("Status is required"),
});
function Locations() {
  const loader = useLoaderConfig();
  const alertToast = useAlertConfig();
  const queryClient = useQueryClient();
  const globalState = useAppSelector(({ global }) => global, shallowEqual);
  const appModePaddingClass =
    globalState.appMode === "FullScreen" ? "p-0 px-2.5 " : " p-2.5  pb-0 ";

  const [locnList, setLocnListData] = useState<ISDTLocationData>({
    LocationsList: [],
  });
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
    data: locnListData,
    isLoading: isLocnListDataLoading,
    isError: isLocnListDataError,
  } = useLocnListDataQuery();

  useEffect(() => {
    if (isLocnListDataLoading) {
      loader.show();
    } else {
      loader.hide();
    }
    if (!isLocnListDataLoading && isLocnListDataError) {
      alertToast.show("error", "Error Reading API", true);
    }
    if (!isLocnListDataLoading && !isLocnListDataError && locnListData) {
      const LocationsList = [...locnListData.LocationsList];

      setLocnListData({
        LocationsList,
      });
    }
  }, [locnListData, isLocnListDataLoading, isLocnListDataError]);

  const { handleSubmit, reset, formState, control } = useForm<IAddLocnForm>({
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
      predicate: (query) => query.queryKey[0] === "locnDataQuery",
    });
  };
  const handleEditLocn = (row: ILocnList) => {
    reset({
      ...showAddDialog.formInitialValues,
      ID: row.ID,
      NAME: row.NAME,
      SHT_NAME: row.SHT_NAME,
      STATUS: row.STATUS,
      LOCN_ID: row.LOCN_ID,
      ORG_ID: row.ORG_ID,
      UNIT_ID: row.UNIT_ID,
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
        LOCN_ID: row.LOCN_ID,
        ORG_ID: row.ORG_ID,
        UNIT_ID: row.UNIT_ID,
      },
    });
  };
  const renderEditControl = (row: ILocnList) => {
    return (
      <IconButton
        onClick={() => {
          handleEditLocn(row);
        }}
      >
        <PencilSquareIcon className="h-4 w-4" />
      </IconButton>
    );
  };
  const handleFormSubmit: SubmitHandler<IAddLocnForm> = (values) => {
    if (showAddDialog.type === "Add") {
      addLocns(values)
        .then(() => {
          alertToast.show("success", "Data Added Succesfully", true, 2000);
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
    } else if (showAddDialog.type === "Update") {
      updateLocns(values)
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
        {locnList.LocationsList && locnList.LocationsList.length <= 0 ? (
          <AlertInfo heading="No Record Found" message="No data found" />
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
                {locnList.LocationsList.map((row) => (
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
                          : row[col.dbCol as keyof ILocnList]}
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
        heading={
          showAddDialog.type === "Add" ? "Location Creation" : "Update Location"
        }
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
              <TextField name="LOCN_ID" label="Location Id" control={control} />
            </div>
            <div className="basis-full md:basis-1/2 p-2">
              <TextField
                name="ORG_ID"
                label="Organization Id"
                control={control}
              />
            </div>
            <div className="basis-full md:basis-1/2 p-2">
              <TextField name="UNIT_ID" label="Unit Id" control={control} />
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

export default Locations;
