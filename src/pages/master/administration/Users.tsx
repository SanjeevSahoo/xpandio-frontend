import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { shallowEqual } from "react-redux";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  FunnelIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";
import { useQueryClient } from "react-query";
import { utils, writeFile } from "xlsx";
import { useDebounce } from "use-debounce";
import { t } from "i18next";

import { useAlertConfig, useLoaderConfig } from "@/features/ui/hooks";
import { useAppSelector } from "@/store/hooks";
import { Button, IconButton } from "@/features/ui/buttons";
import { useUserDBQuery } from "@/features/common/hooks";
import { IUserData, IUserDataEdit, IUserFilter } from "@/features/users/types";
import { InputText, Select } from "@/features/ui/elements";
import { IOptionList } from "@/features/ui/types";
import useUserDetailsQuery from "@/features/users/hooks/useUserDetailsQuery";
import ModalPopup from "@/features/ui/popup";
import { DropdownList, TextField } from "@/features/ui/form";
import { API_BASE_URL, ASSET_BASE_URL } from "@/features/common/constants";
import {
  rectifyUserImages,
  updateUserData,
} from "@/features/users/services/user.service";

interface ILogUserTeamData {
  userDataList: IUserData[];
}

const initialFilterValues: IUserFilter = {
  ID: 0,
  EMP_ID: "",
  EMP_NAME: "",
  BASE_LOCN_ID: 0,
  EMAIL: "",
  PERSONNEL_SUBAREA: "All",
  SAP_STATUS: "All",
  EMP_TYPE: "All",
  USERNAME: "",
  GRADE: "All",
  SHOW_ADMIN_COL: 0,
  SHOW_ROLES: 0,
  IN_ROLE: 1,
  IN_ROLE_LIST: [],
  IN_MAPPING: 1,
  IN_MAPPING_LIST: [],
  ALLOWED_DOMAIN_LOGIN: "All",
  IS_FILTER_QUERY: 0,
};

interface IExportCol {
  name: string;
  key: keyof IUserData;
}

const filterSchema = Yup.object().shape({
  EMP_ID: Yup.string().max(50, "Maximum 50 characters can be entered"),
  EMP_NAME: Yup.string().max(200, "Maximum 200 characters can be entered"),
  EMAIL: Yup.string().max(200, "Maximum 200 characters can be entered"),
  PERSONNEL_SUBAREA: Yup.string().max(
    200,
    "Maximum 200 characters can be entered",
  ),
  USERNAME: Yup.string().max(100, "Maximum 200 characters can be entered"),
});

const tableColumns = [
  {
    label: "ID",
    minWidth: "min-w-[100px]",
    dbCol: "ID",
    colType: "Normal",
  },
  {
    label: "Ticket No",
    minWidth: "min-w-[140px]",
    dbCol: "EMP_ID",
    colType: "Normal",
  },
  {
    label: "Emp Name",
    minWidth: "min-w-[200px]",
    dbCol: "EMP_NAME",
    colType: "Normal",
  },
  {
    label: "SAP Status",
    minWidth: "min-w-[140px]",
    dbCol: "SAP_STATUS",
    colType: "Normal",
  },
  {
    label: "Base Location",
    minWidth: "min-w-[140px]",
    dbCol: "BASE_LOCN_NAME",
    colType: "Normal",
  },
  {
    label: "Personnel Sub Area",
    minWidth: "min-w-[200px]",
    dbCol: "PERSONNEL_SUBAREA",
    colType: "Normal",
  },
  {
    label: "Emp Type",
    minWidth: "min-w-[140px]",
    dbCol: "EMP_TYPE",
    colType: "Normal",
  },
  {
    label: "Gender",
    minWidth: "min-w-[140px]",
    dbCol: "GENDER",
    colType: "Normal",
  },
  {
    label: "Email",
    minWidth: "min-w-[200px]",
    dbCol: "EMAIL",
    colType: "Normal",
  },
  {
    label: "SDT Team Name",
    minWidth: "min-w-[200px]",
    dbCol: "SDT_TEAM_NAME",
    colType: "Normal",
  },
  {
    label: "SDT Area Name",
    minWidth: "min-w-[250px]",
    dbCol: "SDT_TEAM_AREA",
    colType: "Normal",
  },
  {
    label: "SDT Division Name",
    minWidth: "min-w-[250px]",
    dbCol: "SDT_TEAM_DIVISION",
    colType: "Normal",
  },
  {
    label: "Mobile No",
    minWidth: "min-w-[140px]",
    dbCol: "MOBILE",
    colType: "Admin",
  },
  {
    label: "Username",
    minWidth: "min-w-[140px]",
    dbCol: "USERNAME",
    colType: "Admin",
  },
  {
    label: "Grade",
    minWidth: "min-w-[140px]",
    dbCol: "GRADE",
    colType: "Admin",
  },
  {
    label: "Designation",
    minWidth: "min-w-[140px]",
    dbCol: "DESIGNATION",
    colType: "Admin",
  },
  {
    label: "Roles",
    minWidth: "min-w-[240px]",
    dbCol: "ROLES",
    colType: "Admin",
  },
  {
    label: "RFID",
    minWidth: "min-w-[140px]",
    dbCol: "RFID",
    colType: "Admin",
  },
  {
    label: "Allowed Domain Login",
    minWidth: "min-w-[240px]",
    dbCol: "ALLOWED_DOMAIN_LOGIN",
    colType: "Admin",
  },
];

const initialEditValues: IUserDataEdit = {
  ID: 0,
  EMP_ID: "",
  EMP_NAME: "", // edit
  SAP_STATUS: "",
  BASE_LOCN_ID: 0, // edit
  BASE_LOCN_NAME: "",
  PERSONNEL_SUBAREA: "",
  EMP_TYPE: "",
  GENDER: "",
  PROFILE_PIC_URL: "", // edit
  EMAIL: "", // edit
  SDT_TEAM_NAME: "",
  SDT_TEAM_AREA: "",
  SDT_TEAM_DIVISION: "",
  MOBILE: "",
  USERNAME: "",
  GRADE: "",
  DESIGNATION: "",
  ROLES: "",
  RFID: "",
  ALLOWED_DOMAIN_LOGIN: "0", // edit
  LOCATIONS: "",
  IS_RFID_RESET: 0,
  IS_PASSWORD_RESET: 0,
  NEW_PASSWORD: "",
  IS_PROFILE_EDIT: 0,
};
const editSchema = Yup.object().shape({
  EMP_NAME: Yup.string()
    .required("Emp Name is required")
    .max(255, "Maximum 255 characters can be entered"),
  PROFILE_PIC_URL: Yup.string()
    .required("Profile Picture is Required")
    .max(255, "Maximum 255 characters can be entered"),
  EMAIL: Yup.string()
    .required("Email is Required")
    .max(255, "Maximum 255 characters can be entered"),
  NEW_PASSWORD: Yup.string().when("IS_PASSWORD_RESET", {
    is: (val: number) => val === 1,
    then: Yup.string()
      .required("New Password must be set for the user")
      .max(18, "Maximum 18 characters can be entered"),
  }),
});

function Users() {
  const alertToast = useAlertConfig();
  const loader = useLoaderConfig();
  const globalState = useAppSelector(({ global }) => global, shallowEqual);
  const authState = useAppSelector(({ auth }) => auth, shallowEqual);
  const imgRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const [dbList, setDBList] = useState<{
    allLocnList: IOptionList[];
    locationList: IOptionList[];
    subAreaList: IOptionList[];
    sapStatusList: IOptionList[];
    empTypeList: IOptionList[];
    gradeList: IOptionList[];
    roleList: IOptionList[];
    mappingList: IOptionList[];
  }>({
    allLocnList: [],
    locationList: [],
    subAreaList: [],
    sapStatusList: [],
    empTypeList: [],
    gradeList: [],
    roleList: [],
    mappingList: [],
  });
  const [filterTicketNo, setFilterTicketNo] = useState("");
  const [filterLocation, setFilterLocation] = useState(0);

  const [debouncedFilterTicketNo] = useDebounce(filterTicketNo, 500);
  const [teamData, setTeamData] = useState<ILogUserTeamData>({
    userDataList: [],
  });

  const [filterList, setFilterList] = useState<IUserFilter>({
    ...initialFilterValues,
  });

  const appModePaddingClass =
    globalState.appMode === "FullScreen" ? "p-0 px-2.5 " : " p-2.5  pb-0 ";

  const isSuperUser =
    authState.ROLES &&
    authState.ROLES.length > 0 &&
    authState.ROLES.includes(2);

  const [showFilterDialog, setShowFilterDialog] = useState({
    status: false,
    formInitialValues: initialFilterValues,
  });

  const [showEditDialog, setShowEditDialog] = useState({
    status: false,
    formInitialValues: initialEditValues,
  });

  const {
    handleSubmit: handleSubmitFilter,
    reset: resetFilter,
    control: controlFilter,
    formState: formStateFilter,
    getValues: getValuesFilter,
    setValue: setValueFilter,
  } = useForm<IUserFilter>({
    defaultValues: initialFilterValues,
    resolver: yupResolver(filterSchema),
  });

  const { submitCount: submitCountFilter, errors: errorsFilter } =
    formStateFilter;

  const {
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    control: controlEdit,
    formState: formStateEdit,
    getValues: getValuesEdit,
    setValue: setValueEdit,
  } = useForm<IUserDataEdit>({
    defaultValues: initialEditValues,
    resolver: yupResolver(editSchema),
  });

  useEffect(() => {
    if (isSuperUser) {
      initialFilterValues.SHOW_ADMIN_COL = 1;
      initialFilterValues.SHOW_ROLES = 1;
    } else {
      initialFilterValues.SHOW_ADMIN_COL = 0;
      initialFilterValues.SHOW_ROLES = 0;
    }
    setFilterList({
      ...initialFilterValues,
    });
  }, []);

  const handleReset = () => {
    resetFilter({
      ...initialFilterValues,
    });
  };

  const handleFilterDialogOpen = () => {
    resetFilter({
      ...filterList,
    });
    setShowFilterDialog({
      status: true,
      formInitialValues: {
        ...filterList,
      },
    });
  };

  const handleFilterDialogClose = () => {
    setShowFilterDialog((oldState) => ({ ...oldState, status: false }));
  };

  const handleFilterFormSubmit: SubmitHandler<IUserFilter> = (values) => {
    setShowFilterDialog((oldState) => ({ ...oldState, status: false }));
    setFilterList({ ...values, IS_FILTER_QUERY: 1 });
  };

  const { submitCount: submitCountEdit, errors: errorsEdit } = formStateEdit;

  const handleEditReset = () => {
    resetEdit({
      ...showEditDialog.formInitialValues,
    });
  };

  const handleEditDialogOpen = (row: IUserData) => {
    const currRow = {
      ...initialEditValues,
      ...row,
      IS_RFID_RESET: 0,
      IS_PASSWORD_RESET: 0,
      NEW_PASSWORD: "",
      ALLOWED_DOMAIN_LOGIN: row.ALLOWED_DOMAIN_LOGIN === "Yes" ? "1" : "0",
      IS_PROFILE_EDIT: 0,
    };
    resetEdit({
      ...currRow,
    });
    setShowEditDialog({
      status: true,
      formInitialValues: {
        ...currRow,
      },
    });
    if (imgRef && imgRef.current) {
      imgRef.current.value = "";
    }
  };

  const handleEditDialogClose = () => {
    setShowEditDialog((oldState) => ({ ...oldState, status: false }));
  };

  const {
    data: userDBListData,
    isLoading: isUserDBListDataLoading,
    isError: isUserDBListDataError,
  } = useUserDBQuery();

  useEffect(() => {
    if (isUserDBListDataLoading) {
      loader.show();
    } else {
      loader.hide();
    }

    if (!isUserDBListDataLoading && isUserDBListDataError) {
      alertToast.show("error", "Error Reading API", true);
    }

    if (!isUserDBListDataLoading && !isUserDBListDataError && userDBListData) {
      setDBList({
        allLocnList: [...userDBListData.allLocnList],
        locationList: [...userDBListData.locnList],
        subAreaList: [...userDBListData.subAreaList],
        sapStatusList: [...userDBListData.sapStatusList],
        empTypeList: [...userDBListData.empTypeList],
        gradeList: [...userDBListData.gradeList],
        roleList: [...userDBListData.roleList],
        mappingList: [...userDBListData.mappingList],
      });
      if (userDBListData.locnList.length > 0) {
        setFilterLocation(+userDBListData.locnList[0].id);
        setFilterList((oldValues) => ({
          ...oldValues,
          BASE_LOCN_ID: +userDBListData.locnList[0].id,
        }));
      }
    }
  }, [userDBListData, isUserDBListDataLoading, isUserDBListDataError]);

  const {
    data: userDetailsData,
    isLoading: isUserDetailsDataLoading,
    isError: isUserDetailsDataError,
  } = useUserDetailsQuery(debouncedFilterTicketNo, filterLocation, filterList);

  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    if (isUserDetailsDataLoading) {
      loader.show();
    } else {
      loader.hide();
    }

    if (!isUserDetailsDataLoading && isUserDetailsDataError) {
      alertToast.show("error", "Error Reading API", true);
    }

    if (
      !isUserDetailsDataLoading &&
      !isUserDetailsDataError &&
      userDetailsData
    ) {
      setTeamData({ userDataList: [...userDetailsData] });
      setCurrentPage(1);
    }
  }, [userDetailsData, isUserDetailsDataLoading, isUserDetailsDataError]);

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers =
    teamData && teamData.userDataList && teamData.userDataList.length > 0
      ? teamData.userDataList.slice(indexOfFirstUser, indexOfLastUser)
      : [];
  const pageNumbers: number[] = [];

  for (
    let i = 1;
    i <= Math.ceil(teamData.userDataList.length / usersPerPage);
    i += 1
  ) {
    pageNumbers.push(i);
  }

  const dbTableCols = tableColumns.filter((item) => {
    let retVal = true;
    if (item.dbCol === "None") {
      retVal = false;
    }
    if (item.colType === "Admin" && !filterList.SHOW_ADMIN_COL) {
      retVal = false;
    }
    return retVal;
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === "userDBQuery" ||
        query.queryKey[0] === "userDetailsQuery",
    });
  };

  const handleEditFormSubmit: SubmitHandler<IUserDataEdit> = (values) => {
    loader.show();
    updateUserData(values)
      .then(() => {
        alertToast.show("success", "Data Updated Succesfully", true, 2000);
        handleEditDialogClose();
        handleRefresh();
        if (imgRef && imgRef.current) {
          imgRef.current.value = "";
        }
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
  };

  const handelExcelExport = () => {
    if (teamData && teamData.userDataList.length > 0) {
      const dbCols: IExportCol[] = dbTableCols.map((col) => {
        return {
          name: col.label,
          key: col.dbCol as keyof IUserData,
        };
      });
      const data = [{ ...dbCols.map((col) => col.name) }];
      for (let iRows = 0; iRows < teamData.userDataList.length; iRows += 1) {
        const currRow: string[] = [];
        dbCols.forEach((col) => {
          currRow.push(teamData.userDataList[iRows][col.key] as string);
        });
        data.push({ ...currRow });
      }
      const wb = utils.book_new();
      const ws = utils.json_to_sheet(data, { skipHeader: true });
      utils.book_append_sheet(wb, ws, "Data");
      writeFile(wb, "UsersDetails.xlsx");
    }
  };

  const handleFilterTicketNoChange = (value: any) => {
    setFilterTicketNo(value);
  };

  const handleFilterLocationChange = (value: number) => {
    setFilterLocation(value);
    setFilterList((oldValues) => ({
      ...oldValues,
      BASE_LOCN_ID: value,
    }));
  };

  const renderPaginationButton = (page: number, type: string) => {
    if (type === "Start") {
      let disabledClass = "";
      if (currentPage === 1) {
        disabledClass = "cursor-not-allowed opacity-50";
      }
      return (
        <li key="Start">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => {
              setCurrentPage((oldState) => oldState - 1);
            }}
            className={`block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${disabledClass}`}
          >
            <svg
              aria-hidden="true"
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>
      );
    }

    if (type === "End") {
      let disabledClass = "";
      if (currentPage === pageNumbers.length) {
        disabledClass = "cursor-not-allowed opacity-50";
      }
      return (
        <li key="End">
          <button
            type="button"
            disabled={currentPage === pageNumbers.length}
            onClick={() => {
              setCurrentPage((oldState) => oldState + 1);
            }}
            className={`block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${disabledClass}`}
          >
            <span className="sr-only">Next</span>
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>
      );
    }

    if (type === "Dummy") {
      return (
        <li key="Dummy">
          <button
            type="button"
            disabled
            className="block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg opacity-50 cursor-not-allowed hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            ...
          </button>
        </li>
      );
    }

    let currClass =
      "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white";
    if (page === currentPage) {
      currClass =
        "z-10 text-blue-600 border-blue-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white";
    }
    return (
      <li key={page}>
        <button
          type="button"
          onClick={() => {
            setCurrentPage(page);
          }}
          className={`px-3 py-2 leading-tight border ${currClass}`}
        >
          {page <= 9 ? `0${page}` : page}
        </button>
      </li>
    );
  };

  const renderFirstHalfPageNumbers = () => {
    const halfNumberPages = Math.floor(pageNumbers.length / 2);
    let startPage = 1;
    let endPage = 8;

    if (
      (currentPage > pageNumbers.length - 7 &&
        currentPage <= pageNumbers.length) ||
      (currentPage >= 1 && currentPage <= 7) ||
      (currentPage > halfNumberPages && halfNumberPages > 15)
    ) {
      startPage = 1;
      endPage = 8;
    } else {
      if (currentPage < pageNumbers.length - 7) {
        endPage = currentPage + 1;
      } else {
        endPage = currentPage;
      }
      startPage = endPage - 7;
      if (startPage <= 0) {
        startPage = 1;
      }
    }

    return pageNumbers
      .filter((item) => item >= startPage && item <= endPage)
      .map((page) => renderPaginationButton(page, "Normal"));
  };

  const renderSecondHalfPageNumbers = () => {
    const halfNumberPages = Math.floor(pageNumbers.length / 2);
    let startPage = pageNumbers.length - 6;
    let endPage = pageNumbers.length;
    if (
      (currentPage > pageNumbers.length - 7 &&
        currentPage <= pageNumbers.length) ||
      (currentPage >= 1 && currentPage <= 7) ||
      currentPage <= halfNumberPages ||
      (halfNumberPages < 15 && currentPage <= pageNumbers.length - 7)
    ) {
      startPage = pageNumbers.length - 6;
      endPage = pageNumbers.length;
    } else {
      startPage = currentPage - 1;

      if (startPage > pageNumbers.length) {
        startPage = pageNumbers.length;
      }
      endPage = startPage + 6;
    }
    return pageNumbers
      .filter((item) => item >= startPage && item <= endPage)
      .map((page) => renderPaginationButton(page, "Normal"));
  };

  const handleInRoleChecked = (
    event: ChangeEvent<HTMLInputElement>,
    roleId: number,
  ) => {
    const arrRoleList = getValuesFilter("IN_ROLE_LIST");
    if (event.target.checked) {
      arrRoleList.push(roleId);
    } else {
      const currIndex = arrRoleList.findIndex((role) => role === roleId);
      if (currIndex >= 0) {
        arrRoleList.splice(currIndex, 1);
      }
    }
    setValueFilter("IN_ROLE_LIST", arrRoleList, { shouldValidate: true });
  };

  const getRoleCheckStatus = (roleId: number) => {
    return getValuesFilter("IN_ROLE_LIST").includes(roleId);
  };

  const handleInMappingChecked = (
    event: ChangeEvent<HTMLInputElement>,
    mappingId: string,
  ) => {
    const arrMappingList = getValuesFilter("IN_MAPPING_LIST");
    if (event.target.checked) {
      arrMappingList.push(mappingId);
    } else {
      const currIndex = arrMappingList.findIndex(
        (mapping) => mapping === mappingId,
      );
      if (currIndex >= 0) {
        arrMappingList.splice(currIndex, 1);
      }
    }
    setValueFilter("IN_MAPPING_LIST", arrMappingList, { shouldValidate: true });
  };

  const getMappingCheckStatus = (mappingId: string) => {
    return getValuesFilter("IN_MAPPING_LIST").includes(mappingId);
  };

  const renderEditControl = (row: IUserData) => {
    if (isSuperUser && filterList.SHOW_ADMIN_COL && filterList.SHOW_ROLES) {
      return (
        <IconButton
          onClick={() => {
            handleEditDialogOpen(row);
          }}
        >
          <PencilSquareIcon className="w-4 h-4" />
        </IconButton>
      );
    }

    return <span>&nbsp;</span>;
  };

  const handleUserRoleChecked = (
    event: ChangeEvent<HTMLInputElement>,
    roleId: number,
  ) => {
    const strRoles = getValuesEdit("ROLES");
    let arrRoles: string[] = [];
    if (strRoles.length > 0) {
      arrRoles = strRoles.split(", ");
    }
    const arrCurrRole = dbList.roleList.filter((item) => item.id === roleId)[0];
    const strCurrRoleText = `${arrCurrRole.name} (${arrCurrRole.id})`;

    if (event.target.checked) {
      arrRoles.push(strCurrRoleText);
    } else {
      const currIndex = arrRoles.findIndex((role) => role === strCurrRoleText);
      if (currIndex >= 0) {
        arrRoles.splice(currIndex, 1);
      }
    }

    const strRolesText = arrRoles.join(", ");
    setValueEdit("ROLES", strRolesText, { shouldValidate: true });
  };

  const getUserRoleCheckStatus = (roleId: number) => {
    const strRoles = getValuesEdit("ROLES");
    let arrRoles: string[] = [];
    if (strRoles.length > 0) {
      arrRoles = strRoles.split(", ");
    }
    const arrCurrRole = dbList.roleList.filter((item) => item.id === roleId)[0];
    const strCurrRoleText = `${arrCurrRole.name} (${arrCurrRole.id})`;
    return arrRoles.includes(strCurrRoleText);
  };

  const handleUserLocationChecked = (
    event: ChangeEvent<HTMLInputElement>,
    locationId: number,
  ) => {
    const strLocations = getValuesEdit("LOCATIONS");
    let arrLocations: string[] = [];
    if (strLocations.length > 0) {
      arrLocations = strLocations.split(",");
    }

    if (event.target.checked) {
      arrLocations.push(locationId.toString());
    } else {
      const currIndex = arrLocations.findIndex(
        (location) => location === locationId.toString(),
      );
      if (currIndex >= 0) {
        arrLocations.splice(currIndex, 1);
      }
    }

    const strLocationsText = arrLocations.join(",");
    setValueEdit("LOCATIONS", strLocationsText, { shouldValidate: true });
  };

  const getUserLocationCheckStatus = (locationId: number) => {
    const strLocations = getValuesEdit("LOCATIONS");
    let arrLocations: string[] = [];
    if (strLocations.length > 0) {
      arrLocations = strLocations.split(",");
    }
    return arrLocations.includes(locationId.toString());
  };

  const getProfileUrl = () => {
    if (getValuesEdit("PROFILE_PIC_URL")) {
      return `${ASSET_BASE_URL}images/profile/${getValuesEdit(
        "PROFILE_PIC_URL",
      )}`;
    }
    return `${ASSET_BASE_URL}images/profile/profile_photo_default.png`;
  };

  const handleProfileFileChange = (e: any) => {
    const formData = new FormData();
    formData.append("filename", `${getValuesEdit("EMP_ID")}_temp.JPG`);
    formData.append("file", e.target.files[0]);
    setValueEdit("PROFILE_PIC_URL", "profile_photo_default.png", {
      shouldValidate: true,
    });
    fetch(`${API_BASE_URL}uploadprofile`, {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (res.status === 200) {
          setValueEdit(
            "PROFILE_PIC_URL",
            `${getValuesEdit("EMP_ID")}_temp.JPG`,
            { shouldValidate: true },
          );
          setValueEdit("IS_PROFILE_EDIT", 1, { shouldValidate: true });
        } else {
          alertToast.show("error", "Error Uploading Image", true);
        }
      })
      .catch(() => {
        alertToast.show("error", "Error Uploading Image", true);
      });
  };

  const handleRectifyImages = () => {
    loader.show();
    rectifyUserImages()
      .then(() => {
        alertToast.show(
          "success",
          "Images Rectified Updated Succesfully",
          true,
          2000,
        );
        handleRefresh();
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
  };
  return (
    <div
      className={`relative w-full h-full grid grid-rows-[auto_1fr_auto] gap-2.5 overflow-auto ${appModePaddingClass} `}
    >
      <div className="h-[50px] flex justify-between items-center p-1.5 px-2.5 border-[1px] text-md font-semibold text-center bg-[#f0f8ff] rounded-lg shadow-md dark:bg-gray-600 dark:text-cyan-200 dark:border-gray-500">
        <div className="flex items-center justify-center gap-2">
          <div>
            <InputText
              value={filterTicketNo}
              changeHandler={(data) => {
                setFilterList({ ...filterList, IS_FILTER_QUERY: 0 });
                handleFilterTicketNoChange(data);
              }}
              size="sm"
              className="w-[240px] bg-transparent"
              placeholder="Search by Ticket No/ Name"
            />
          </div>
          <div>
            <Select
              value={filterLocation}
              onChange={(e) => {
                handleFilterLocationChange(+e.target.value);
              }}
              size="sm"
              className="bg-transparent"
            >
              {dbList.locationList.map((locn) => (
                <option key={locn.id} value={locn.id}>
                  {locn.name}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-4 ml-20">
          {isSuperUser && (
            <Button
              btnType="info"
              className="text-xs"
              onClick={handleRectifyImages}
            >
              Rectify Images
            </Button>
          )}
          <IconButton onClick={handelExcelExport}>
            <ArrowDownTrayIcon className="w-4 h-4" />
          </IconButton>
          <IconButton onClick={handleFilterDialogOpen}>
            <FunnelIcon className="w-4 h-4" />
          </IconButton>
          <IconButton onClick={handleRefresh}>
            <ArrowPathIcon className="w-4 h-4" />
          </IconButton>
        </div>
      </div>
      <div className="h-full overflow-auto border-[1px] dark:border-gray-700">
        <table className="text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th
                key="ID"
                className="w-[140px]  text-right py-3 px-6 sticky top-0 bg-gray-50 dark:bg-gray-700 "
              >
                ID
              </th>
              {dbTableCols
                .filter((item) => item.dbCol !== "ID")
                .map((col) => (
                  <th
                    key={col.dbCol}
                    className={`${col.minWidth} py-3 px-6 sticky top-0 bg-gray-50 dark:bg-gray-700 `}
                  >
                    {col.label}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {currentUsers.map((row) => (
              <tr
                key={`${row.ID}`}
                className="border-[1px] bg-white dark:bg-gray-800 dark:border-gray-700  "
              >
                <td
                  key={`${row.ID}_ID`}
                  className="px-6 py-1 font-normal text-right text-cyan-700 whitespace-nowrap dark:text-white "
                >
                  <div className="w-[140px] grid grid-cols-[auto_1fr_auto] gap-2 justify-between items-center">
                    <div>{renderEditControl(row)}</div>
                    <div>
                      <img
                        className="h-[40px] w-[40px] rounded-full"
                        src={`${ASSET_BASE_URL}images/profile/${
                          row.PROFILE_PIC_URL
                            ? row.PROFILE_PIC_URL
                            : "profile_photo_default.png"
                        }`}
                        alt="profile"
                        onError={({ currentTarget }) => {
                          currentTarget.onerror = null; // prevents looping
                          currentTarget.src = `${ASSET_BASE_URL}images/profile/profile_photo_default.png`;
                        }}
                      />
                    </div>
                    {row.ID}
                  </div>
                </td>
                {dbTableCols
                  .filter((item) => item.dbCol !== "ID")
                  .map((col) => (
                    <td
                      key={`${row.ID}_${col.dbCol}`}
                      className="px-6 py-4 font-normal text-cyan-700 whitespace-nowrap dark:text-white "
                    >
                      {row[col.dbCol as keyof IUserData]}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-center">
        {pageNumbers.length <= 0 && (
          <span className="text-sm text-gray-500">No Data Found</span>
        )}
        {pageNumbers.length > 0 && pageNumbers.length <= 15 && (
          <ul className="inline-flex items-center -space-x-px">
            {pageNumbers.length > 5 && renderPaginationButton(0, "Start")}
            {pageNumbers.map((page) => renderPaginationButton(page, "Normal"))}
            {pageNumbers.length > 5 && renderPaginationButton(0, "End")}
          </ul>
        )}
        {pageNumbers.length > 15 && (
          <ul className="inline-flex items-center -space-x-px">
            {renderPaginationButton(0, "Start")}
            {renderFirstHalfPageNumbers()}
            {renderPaginationButton(0, "Dummy")}
            {renderSecondHalfPageNumbers()}
            {renderPaginationButton(0, "End")}
          </ul>
        )}
      </div>
      <ModalPopup
        heading="Search Users"
        onClose={handleFilterDialogClose}
        openStatus={showFilterDialog.status}
        hasSubmit
        onSubmit={() => {
          handleSubmitFilter(handleFilterFormSubmit)();
        }}
        onReset={() => {
          handleReset();
        }}
        hasReset
        size="large"
        showError
        hasError={
          !(Object.keys(errorsFilter).length === 0) && submitCountFilter > 0
        }
      >
        <form className="bg-[#ecf3f9] dark:bg-gray-600 grid gap-2.5 p-2.5">
          <div className="flex flex-wrap justify-evenly items-center p-2.5 border-[1px]  border-gray-300 rounded-lg dark:border-gray-500">
            <div className="p-2 basis-full sm:basis-1/2 lg:basis-1/4">
              <TextField
                type="number"
                name="ID"
                label="ID"
                control={controlFilter}
              />
            </div>
            <div className="p-2 basis-full sm:basis-1/2 lg:basis-1/4">
              <TextField
                name="EMP_ID"
                label="Ticket No"
                control={controlFilter}
              />
            </div>
            <div className="p-2 basis-full sm:basis-1/2 lg:basis-2/4">
              <TextField
                name="EMP_NAME"
                label="Employee Name"
                control={controlFilter}
              />
            </div>
            <div className="p-2 basis-full sm:basis-1/2 lg:basis-1/4">
              <DropdownList
                name="SAP_STATUS"
                label="SAP Status"
                control={controlFilter}
                optionList={[
                  { id: "All", name: "All Status" },
                  ...dbList.sapStatusList,
                ]}
              />
            </div>
            <div className="p-2 basis-full sm:basis-1/2 lg:basis-1/4">
              <DropdownList
                name="EMP_TYPE"
                label="Employee Type"
                control={controlFilter}
                optionList={[
                  { id: "All", name: "All Employee Type" },
                  ...dbList.empTypeList,
                ]}
              />
            </div>
            <div className="p-2 basis-full sm:basis-1/2 lg:basis-2/4">
              <TextField name="EMAIL" label="Email" control={controlFilter} />
            </div>
            <div className="p-2 basis-full sm:basis-1/2 lg:basis-1/4">
              <DropdownList
                name="BASE_LOCN_ID"
                label="Base Location"
                control={controlFilter}
                optionList={[...dbList.locationList]}
              />
            </div>
            {isSuperUser && (
              <div className="p-2 basis-full sm:basis-1/2 lg:basis-1/4">
                <TextField
                  name="USERNAME"
                  label="Username"
                  control={controlFilter}
                />
              </div>
            )}
            {isSuperUser && (
              <div className="p-2 basis-full sm:basis-1/2 lg:basis-2/4">
                <DropdownList
                  name="PERSONNEL_SUBAREA"
                  label="Personnel Subarea"
                  control={controlFilter}
                  optionList={[
                    { id: "All", name: "All Personnel Subarea" },
                    ...dbList.subAreaList,
                  ]}
                />
              </div>
            )}
            {!isSuperUser && (
              <div className="p-2 basis-full sm:basis-1/2 lg:basis-3/4">
                <DropdownList
                  name="PERSONNEL_SUBAREA"
                  label="Personnel Subarea"
                  control={controlFilter}
                  optionList={[
                    { id: "All", name: "All Personnel Subarea" },
                    ...dbList.subAreaList,
                  ]}
                />
              </div>
            )}
            {isSuperUser && (
              <div className="p-2 basis-full sm:basis-1/2 lg:basis-1/4">
                <DropdownList
                  name="GRADE"
                  label="Grade"
                  control={controlFilter}
                  optionList={[
                    { id: "All", name: "All Grades" },
                    ...dbList.gradeList,
                  ]}
                />
              </div>
            )}
            {isSuperUser && (
              <div className="p-2 basis-full sm:basis-1/2 lg:basis-1/4">
                <DropdownList
                  name="SHOW_ADMIN_COL"
                  label="Show Admin Cols"
                  control={controlFilter}
                  optionList={[
                    { id: 0, name: "No" },
                    { id: 1, name: "Yes" },
                  ]}
                />
              </div>
            )}
            {isSuperUser && (
              <div className="p-2 basis-full sm:basis-1/2 lg:basis-1/4">
                <DropdownList
                  name="SHOW_ROLES"
                  label="Show Roles"
                  control={controlFilter}
                  optionList={[
                    { id: 0, name: "No" },
                    { id: 1, name: "Yes" },
                  ]}
                />
              </div>
            )}
            {isSuperUser && (
              <div className="p-2 basis-full sm:basis-1/2 lg:basis-1/4">
                <DropdownList
                  name="ALLOWED_DOMAIN_LOGIN"
                  label="Allowed Domain Login"
                  control={controlFilter}
                  optionList={[
                    { id: "All", name: "All" },
                    { id: "0", name: "No" },
                    { id: "1", name: "Yes" },
                  ]}
                />
              </div>
            )}
            {isSuperUser && (
              <div className="flex flex-wrap items-center p-2 basis-full justify-evenly ">
                <div className="p-2 basis-full lg:basis-1/4">
                  <DropdownList
                    name="IN_ROLE"
                    label="Role Selection"
                    control={controlFilter}
                    optionList={[
                      { id: 1, name: "In Role" },
                      { id: 0, name: "Not In Role" },
                    ]}
                  />
                </div>
                <div className="p-2 basis-full lg:basis-3/4 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))]  gap-2  justify-evenly ">
                  {dbList.roleList.map((role) => (
                    <div
                      key={role.id}
                      className="border-[1px] border-gray-300 rounded-lg dark:border-gray-500"
                    >
                      <label
                        htmlFor={`role-check-${role.id}`}
                        className="flex items-center justify-start w-full gap-2 p-2 text-sm rounded text-cyan-700 dark:text-gray-300"
                      >
                        <input
                          id={`role-check-${role.id}`}
                          type="checkbox"
                          checked={getRoleCheckStatus(+role.id)}
                          onChange={(event) => {
                            handleInRoleChecked(event, +role.id);
                          }}
                          name={`role-check-${role.id}`}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        {role.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {isSuperUser && (
              <div className="flex flex-wrap items-center p-2 basis-full justify-evenly bg-gray-50 dark:bg-gray-700">
                <div className="p-2 basis-full lg:basis-1/4">
                  <DropdownList
                    name="IN_MAPPING"
                    label="Mapping Selection"
                    control={controlFilter}
                    optionList={[
                      { id: 1, name: "In Mapping" },
                      { id: 0, name: "Not In Mapping" },
                    ]}
                  />
                </div>
                <div className="p-2 basis-full lg:basis-3/4 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))]  gap-2  justify-evenly ">
                  {dbList.mappingList.map((mapping) => (
                    <div
                      key={mapping.id}
                      className="border-[1px] border-gray-300 rounded-lg dark:border-gray-500"
                    >
                      <label
                        htmlFor={`mapping-check-${mapping.id}`}
                        className="flex items-center justify-start w-full gap-2 p-2 text-sm rounded text-cyan-700 dark:text-gray-300"
                      >
                        <input
                          id={`mapping-check-${mapping.id}`}
                          type="checkbox"
                          checked={getMappingCheckStatus(mapping.id.toString())}
                          onChange={(event) => {
                            handleInMappingChecked(
                              event,
                              mapping.id.toString(),
                            );
                          }}
                          name={`mapping-check-${mapping.id}`}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        {mapping.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
      </ModalPopup>
      <ModalPopup
        heading="Edit User"
        onClose={handleEditDialogClose}
        openStatus={showEditDialog.status}
        hasSubmit
        onSubmit={() => {
          handleSubmitEdit(handleEditFormSubmit)();
        }}
        onReset={() => {
          handleEditReset();
        }}
        hasReset
        size="fullscreen"
        showError
        hasError={
          !(Object.keys(errorsEdit).length === 0) && submitCountEdit > 0
        }
      >
        <form className="w-full h-full bg-[#ecf3f9] dark:bg-gray-600 p-4">
          <div className="w-full h-full grid grid-cols-[7fr_2fr] gap-4 ">
            <div className="h-full grid grid-rows-[auto_1fr] gap-4 overflow-auto">
              <div className="flex flex-wrap justify-evenly items-center p-4 border-[1px]  border-gray-300 rounded-lg dark:border-gray-500">
                <div className="p-2 basis-full lg:basis-1/4">
                  <TextField
                    disabled
                    name="EMP_ID"
                    label="Ticket No"
                    control={controlEdit}
                  />
                </div>
                <div className="p-2 basis-full lg:basis-2/4">
                  <TextField
                    name="EMP_NAME"
                    label="Employee Name"
                    control={controlEdit}
                  />
                </div>
                <div className="p-2 basis-full lg:basis-1/4">
                  <TextField
                    disabled
                    name="SAP_STATUS"
                    label="SAP Status"
                    control={controlEdit}
                  />
                </div>
                <div className="p-2 basis-full lg:basis-1/4">
                  <TextField
                    disabled
                    name="USERNAME"
                    label="Username"
                    control={controlEdit}
                  />
                </div>
                <div className="p-2 basis-full lg:basis-2/4">
                  <TextField name="EMAIL" label="Email" control={controlEdit} />
                </div>
                <div className="p-2 basis-full lg:basis-1/4">
                  <TextField
                    disabled
                    name="EMP_TYPE"
                    label="Employee Type"
                    control={controlEdit}
                  />
                </div>
                <div className="p-2 basis-full lg:basis-1/4">
                  <TextField
                    disabled
                    name="GRADE"
                    label="Grade"
                    control={controlEdit}
                  />
                </div>
                <div className="p-2 basis-full lg:basis-2/4">
                  <TextField
                    disabled
                    name="PERSONNEL_SUBAREA"
                    label="Personnel Subarea"
                    control={controlEdit}
                  />
                </div>
                <div className="p-2 basis-full lg:basis-1/4">
                  <DropdownList
                    name="BASE_LOCN_ID"
                    label="Base Location"
                    control={controlEdit}
                    optionList={
                      userDBListData && userDBListData.allLocnList
                        ? userDBListData?.allLocnList
                        : []
                    }
                    changeHandler={(data) => {
                      setValueEdit("LOCATIONS", data.toString(), {
                        shouldValidate: true,
                      });
                    }}
                  />
                </div>
                <div className="p-2 basis-full lg:basis-1/4">
                  <TextField
                    disabled
                    name="MOBILE"
                    label="Mobile"
                    control={controlEdit}
                  />
                </div>
                <div className="p-2 basis-full lg:basis-2/4">
                  <TextField
                    disabled
                    name="DESIGNATION"
                    label="Designation"
                    control={controlEdit}
                  />
                </div>
                <div className="p-2 basis-full lg:basis-1/4">
                  <DropdownList
                    name="ALLOWED_DOMAIN_LOGIN"
                    label="Allowed Domain Login"
                    control={controlEdit}
                    optionList={[
                      { id: "0", name: "No" },
                      { id: "1", name: "Yes" },
                    ]}
                  />
                </div>
              </div>
              <div className="h-full grid grid-cols-[1fr_3fr] gap-4 overflow-auto">
                <div className="flex flex-wrap justify-evenly items-center p-4 border-[1px]  border-gray-300 rounded-lg dark:border-gray-500">
                  <div className="h-full w-full grid grid-rows-[auto_1fr]">
                    <div className="h-[35px] text-sm font-semibold text-cyan-700 dark:text-cyan-200 text-center">
                      Reset RFID/ Password
                    </div>
                    <div className="grid items-start grid-cols-1 gap-2 p-4 bg-gray-50 dark:bg-gray-700">
                      <div>
                        <label
                          htmlFor="rfidreset-check"
                          className="flex items-center justify-start w-full gap-2 p-2 text-sm rounded text-cyan-700 dark:text-gray-300"
                        >
                          <input
                            id="rfidreset-check"
                            type="checkbox"
                            checked={getValuesEdit("IS_RFID_RESET") === 1}
                            onChange={() => {
                              if (getValuesEdit("IS_RFID_RESET") === 0) {
                                setValueEdit("IS_RFID_RESET", 1, {
                                  shouldValidate: true,
                                });
                              } else {
                                setValueEdit("IS_RFID_RESET", 0, {
                                  shouldValidate: true,
                                });
                              }
                            }}
                            name="rfidreset-check"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          Reset RFID
                        </label>
                      </div>
                      <div>
                        <label
                          htmlFor="passwordreset-check"
                          className="flex items-center justify-start w-full gap-2 p-2 text-sm rounded text-cyan-700 dark:text-gray-300"
                        >
                          <input
                            id="passwordreset-check"
                            type="checkbox"
                            checked={getValuesEdit("IS_PASSWORD_RESET") === 1}
                            onChange={() => {
                              if (getValuesEdit("IS_PASSWORD_RESET") === 0) {
                                setValueEdit("IS_PASSWORD_RESET", 1, {
                                  shouldValidate: true,
                                });
                              } else {
                                setValueEdit("IS_PASSWORD_RESET", 0, {
                                  shouldValidate: true,
                                });
                                setValueEdit("NEW_PASSWORD", "", {
                                  shouldValidate: true,
                                });
                              }
                            }}
                            name="passwordreset-check"
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                          />
                          Update Password
                        </label>
                        <TextField
                          showLabel={false}
                          type="password"
                          name="NEW_PASSWORD"
                          label="New Password"
                          control={controlEdit}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-full flex flex-wrap justify-evenly items-center p-4 border-[1px]  border-gray-300 rounded-lg dark:border-gray-500 overflow-auto">
                  <div className="h-full w-full grid grid-rows-[auto_1fr] overflow-auto">
                    <div className="h-[35px] text-sm font-semibold text-cyan-700 dark:text-cyan-200 text-center">
                      User Roles
                    </div>
                    <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-700">
                      <div className=" p-4 basis-full grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))]  gap-4 items-start  justify-evenly overflow-auto">
                        {dbList.roleList.map((role) => (
                          <div
                            key={role.id}
                            className="border-[1px] border-gray-300 rounded-lg dark:border-gray-500 shadow-md "
                          >
                            <label
                              htmlFor={`userrole-check-${role.id}`}
                              className="flex items-center justify-start w-full gap-2 p-4 text-sm rounded text-cyan-700 dark:text-gray-300"
                            >
                              <input
                                id={`userrole-check-${role.id}`}
                                type="checkbox"
                                checked={getUserRoleCheckStatus(+role.id)}
                                onChange={(event) => {
                                  handleUserRoleChecked(event, +role.id);
                                }}
                                name={`userrole-check-${role.id}`}
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                              />
                              {role.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="h-full grid grid-rows-[auto_1fr] gap-4 overflow-auto">
              <div className="flex flex-wrap justify-evenly items-center p-4 border-[1px]  border-gray-300 rounded-lg dark:border-gray-500">
                <div className="grid grid-rows-[1fr_auto] gap-2 items-center justify-center p-2 basis-full">
                  <div className="flex items-center justify-center">
                    <img
                      className="w-[80%] "
                      src={getProfileUrl()}
                      alt="profile"
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = `${ASSET_BASE_URL}images/profile/profile_photo_default.png`;
                      }}
                    />
                  </div>
                  <div className="w-full overflow-hidden">
                    <input
                      className="block w-full text-xs text-gray-900 border border-gray-300 cursor-pointer dark:text-gray-400 focus:outline-none dark:border-gray-600 dark:placeholder-gray-400"
                      type="file"
                      name="file"
                      onChange={handleProfileFileChange}
                      accept="image/jpeg"
                      ref={imgRef}
                    />
                  </div>
                </div>
              </div>
              <div className="h-full flex flex-wrap justify-evenly items-center p-4 border-[1px]  border-gray-300 rounded-lg dark:border-gray-500 overflow-auto">
                <div className="h-full w-full grid grid-rows-[auto_1fr] overflow-auto">
                  <div className="h-[35px] text-sm font-semibold text-cyan-700 dark:text-cyan-200 text-center">
                    User Locations
                  </div>
                  <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-700">
                    <div className="p-4 basis-full grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))]  gap-2  items-start justify-evenly overflow-auto">
                      {dbList.allLocnList.map((location) => (
                        <div
                          key={location.id}
                          className="border-[1px] border-gray-300 rounded-lg dark:border-gray-500 shadow-md "
                        >
                          <label
                            htmlFor={`userlocation-check-${location.id}`}
                            className="flex items-center justify-start w-full gap-2 p-2 text-sm rounded text-cyan-700 dark:text-gray-300"
                          >
                            <input
                              id={`userlocation-check-${location.id}`}
                              type="checkbox"
                              checked={getUserLocationCheckStatus(+location.id)}
                              onChange={(event) => {
                                handleUserLocationChecked(event, +location.id);
                              }}
                              name={`userlocation-check-${location.id}`}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            {location.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </ModalPopup>
    </div>
  );
}

export default Users;
