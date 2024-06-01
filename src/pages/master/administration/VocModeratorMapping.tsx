import {
  PlusIcon,
  ArrowPathIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import React, { useCallback, useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import { shallowEqual } from "react-redux";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useQueryClient } from "react-query";
import { useTranslation } from "react-i18next";
import { debounce } from "lodash";
import { useAppSelector } from "@/store/hooks";
import { AlertInfo, ConfirmBox } from "@/features/ui/alerts";
import { IconButton } from "@/features/ui/buttons";
import { Select, SelectSearchable } from "@/features/ui/elements";
import ModalPopup from "@/features/ui/popup";
import { IOptionList } from "@/features/ui/types";
import { ILocationItem, IOrgItem } from "@/features/common/types";
import {
  IGetVocModeratorMappedData,
  ILocnDivAreaDataVoc,
  IVocModeratorMappingForm,
} from "@/features/master/types";
import {
  deleteVocModeratorMapped,
  getVocModeratorList,
  vocmoderatormapping,
} from "@/features/master/services/common.services";
import { useLoaderConfig, useAlertConfig } from "@/features/ui/hooks";
import {
  useFilterLocnDivAreaVocDataQuery,
  useLocnDivAreaVocDataQuery,
  useVocModeratorDataQuery,
} from "@/features/master/hooks";
import {
  DEFAULT_VALUE_ALLDIVISION,
  DEFAULT_VALUE_DIVISION,
  DEFAULT_VALUE_LOCATION,
} from "@/features/common/constants";
import { getSapUser } from "@/features/users/services/user.service";

const formSchema = Yup.object().shape({
  DIV_ID: Yup.number().required("Division is required"),
  USER_ID: Yup.number().required("Please Select User"),
});

const initialFormValues: IVocModeratorMappingForm = {
  LOCN_ID: 0,
  DIV_ID: 0,
  USER_ID: 0,
  ROLE_ID: 15,
  USER_NAME: "",
};

const tableColumns = [
  {
    label: "Id",
    minWidth: "min-w-[80px]",
    dbCol: "ID",
  },
  {
    label: "Ticket No",
    minWidth: "min-w-[100px]",
    dbCol: "EMP_ID",
  },
  {
    label: "Employee NAME",
    minWidth: "min-w-[100px]",
    dbCol: "EMP_NAME",
  },
  {
    label: "DIV NAME",
    minWidth: "min-w-[100px]",
    dbCol: "DIVISIONNAME",
  },
  {
    label: "CREATED BY",
    minWidth: "min-w-[120px]",
    dbCol: "CREATED_BY",
  },
  {
    label: "CREATED DATE",
    minWidth: "min-w-[100px]",
    dbCol: "CREATED_DATE",
  },
  {
    label: "Action",
    minWidth: "min-w-[100px]",
    dbCol: "",
  },
];

interface ILogVocModeratorData {
  historyLogVocModeratorData: IGetVocModeratorMappedData[];
}

function VocModeratorMapping() {
  const loader = useLoaderConfig();
  const alertToast = useAlertConfig();

  const { t } = useTranslation(["common"]);
  const imgRef = useRef<HTMLInputElement>(null);

  const [locationList, setLocationList] = useState<ILocationItem[]>([]);
  const [locationId, setlocationId] = useState<number>(-2);
  const [divisionList, setDivisionList] = useState<IOrgItem[]>([]);
  const [divisionId, setDivisionId] = useState<number>(-2);

  const queryClient = useQueryClient();
  const authState = useAppSelector(({ auth }) => auth, shallowEqual);
  const globalState = useAppSelector(({ global }) => global, shallowEqual);
  const [searchText, setSearchText] = useState("");
  const [userOptionList, setUserOptionList] = useState<IOptionList[]>([]);
  const appModePaddingClass =
    globalState.appMode === "FullScreen" ? "p-0 px-2.5 " : " p-2.5  pb-0 ";
  const isEditAllowed =
    authState.ROLES.includes(2) || authState.ROLES.includes(10);
  const handleLocationChange = (newlocnId: number) => {
    setlocationId(newlocnId);
  };

  const [showAddDialog, setShowAddDialog] = useState({
    status: false,
    formInitialValues: initialFormValues,
  });
  const [moderatorMapData, setModeratorMapData] =
    useState<ILogVocModeratorData>({
      historyLogVocModeratorData: [],
    });

  const [filterLocationId, setFilterLocationId] = useState<number>(-2);
  const [filterDivisionList, setFilterDivisionList] = useState<IOrgItem[]>([]);
  const [filterDivisionId, setFilterDivisionId] = useState<number>(-2);
  const [filterLocationList, setFilterLocationList] = useState<ILocationItem[]>(
    [],
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [vocPerPage] = useState(10);

  const [filtercompiledOrgData, setFilterCompiledOrgData] =
    useState<ILocnDivAreaDataVoc>({
      locations: [
        {
          ...DEFAULT_VALUE_LOCATION,
        },
      ],
      divisions: [
        {
          ...DEFAULT_VALUE_DIVISION,
        },
      ],
    });

  const [compiledOrgData, setCompiledOrgData] = useState<ILocnDivAreaDataVoc>({
    locations: [
      {
        ...DEFAULT_VALUE_LOCATION,
      },
    ],
    divisions: [
      {
        ...DEFAULT_VALUE_DIVISION,
      },
    ],
  });

  const [lastSelection, setLastSelection] = useState<{
    locationId: number;
    divisionId: number;
  }>({
    locationId: -2,
    divisionId: -2,
  });

  const {
    handleSubmit,
    reset,
    formState,
    getValues,
    setValue,
    watch: watchValues,
  } = useForm<IVocModeratorMappingForm>({
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
      predicate: (query) =>
        query.queryKey[0] === "vocModeratorDataQuery" ||
        query.queryKey[0] === "locnDivAreaDataVocQuery" ||
        query.queryKey[0] === "locnDivAreaFilterVocDataQuery" ||
        query.queryKey[0] === "vocModeratorDataQuery",
    });
  };

  const handleAddIteam = () => {
    handleRefresh();
    reset({
      ...showAddDialog.formInitialValues,
      LOCN_ID: filterLocationId,
      DIV_ID: filterDivisionId,
    });
    setShowAddDialog({
      status: true,
      formInitialValues: {
        ...showAddDialog.formInitialValues,
        LOCN_ID: filterLocationId,
      },
    });
  };

  const handleFormSubmit: SubmitHandler<IVocModeratorMappingForm> = (
    values,
  ) => {
    loader.show();
    vocmoderatormapping(values)
      .then(() => {
        alertToast.show("success", "Data added Succesfully", true, 2000);
        if (imgRef && imgRef.current) {
          imgRef.current.value = "";
        }
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
  };

  const handleDeleted = (USER_ID: number, DIV_ID: number) => {
    deleteVocModeratorMapped(USER_ID, DIV_ID).then((response) => {
      if (response.status === 200) {
        handleRefresh();
        alertToast.show("success", "Deleted Successfully", true);
      }
    });
  };

  const renderDelete = (USER_ID: number, DIV_ID: number) => {
    return (
      <IconButton
        onClick={() => {
          handleDeleted(USER_ID, DIV_ID);
        }}
      >
        <TrashIcon className="w-4 h-4 text-red-500 dark:text-red-400" />
      </IconButton>
    );
  };

  const {
    data: orgData,
    isLoading: isOrgDataLoading,
    isError: isOrgDataError,
  } = useLocnDivAreaVocDataQuery(authState.ID);

  useEffect(() => {
    if (isOrgDataLoading) {
      loader.show();
    } else {
      loader.hide();
    }

    if (!isOrgDataLoading && isOrgDataError) {
      alertToast.show("error", "Error Reading API", true);
    }

    if (!isOrgDataLoading && !isOrgDataError && orgData) {
      if (globalState.lastSelection.locationId > 0) {
        setLastSelection({
          locationId,
          divisionId,
        });
      }

      let currDivisionList = [...orgData.divisions];
      let currLocationList = [...orgData.locations];

      let locId = 0;
      let orgId = 0;
      let unitId = 0;

      if (authState.ROLES && authState.ROLES.length > 0) {
        if (!authState.ROLES.includes(2) && !authState.ROLES.includes(10)) {
          currDivisionList = [{ ...DEFAULT_VALUE_DIVISION }];
          currLocationList = [{ ...DEFAULT_VALUE_LOCATION }];
        }

        if (currDivisionList.length <= 0) {
          currDivisionList = [{ ...DEFAULT_VALUE_DIVISION }];
        }
        if (currLocationList.length <= 0) {
          currLocationList = [{ ...DEFAULT_VALUE_LOCATION }];
        }

        if (locationList.length > 0) {
          locId = Number(locationList[0].LOCN_ID);
          orgId = Number(locationList[0].ORG_ID);
          unitId = Number(locationList[0].UNIT_ID);
          currDivisionList = [
            ...currDivisionList.filter(
              (div) =>
                div.LOCN_ID === locId &&
                +div.SOS_ORG_ID === orgId &&
                +div.SOS_UNIT_ID === unitId,
            ),
          ];
        }
      } else {
        currDivisionList = [{ ...DEFAULT_VALUE_DIVISION }];
        currLocationList = [{ ...DEFAULT_VALUE_LOCATION }];
      }
      setCompiledOrgData({
        locations: [...currLocationList],
        divisions: [...currDivisionList],
      });
    }
  }, [orgData, isOrgDataLoading, isOrgDataError]);

  useEffect(() => {
    if (
      !isOrgDataLoading &&
      compiledOrgData.locations &&
      compiledOrgData.locations.length > 0
    ) {
      setLocationList(compiledOrgData.locations);
      let currLocnId = 0;

      if (locationId > 0 && lastSelection.locationId > 0) {
        currLocnId = lastSelection.locationId;
      } else {
        currLocnId = compiledOrgData.locations.some(
          (location) => location.ID === authState.BASE_LOCN_ID,
        )
          ? authState.BASE_LOCN_ID
          : compiledOrgData.locations[0].ID;
      }
      setlocationId(currLocnId);
    }
  }, [compiledOrgData]);

  useEffect(() => {
    if (!isOrgDataLoading && locationId !== -2 && compiledOrgData) {
      let currDivisionList = [...compiledOrgData.divisions];

      if (locationId > 0) {
        currDivisionList = currDivisionList.filter(
          (item) => item.LOCN_ID === locationId,
        );
      }

      if (currDivisionList && currDivisionList.length <= 0) {
        currDivisionList = [{ ...DEFAULT_VALUE_DIVISION }];
      }

      if (currDivisionList && currDivisionList.length > 0) {
        if (authState.ROLES.includes(2) || authState.ROLES.includes(10)) {
          currDivisionList = [
            { ...DEFAULT_VALUE_ALLDIVISION },
            ...currDivisionList,
          ];
        }
      }

      setDivisionList([...currDivisionList]);

      setDivisionId(currDivisionList[0].ID);
    }
  }, [compiledOrgData, locationId]);

  /*-------------------------------------*/

  const {
    data: orgFilterData,
    isLoading: isOrgFilterDataLoading,
    isError: isOrgFilterDataError,
  } = useFilterLocnDivAreaVocDataQuery(authState.ID);

  useEffect(() => {
    if (isOrgFilterDataLoading) {
      loader.show();
    } else {
      loader.hide();
    }

    if (!isOrgFilterDataLoading && isOrgFilterDataError) {
      alertToast.show("error", "Error Reading API", true);
    }

    if (!isOrgFilterDataLoading && !isOrgFilterDataError && orgFilterData) {
      let currDivisionList = [...orgFilterData.divisions];
      let currLocationList = [...orgFilterData.locations];

      let locId = 0;
      let orgId = 0;
      let unitId = 0;

      if (authState.ROLES && authState.ROLES.length > 0) {
        if (!authState.ROLES.includes(2) && !authState.ROLES.includes(10)) {
          currDivisionList = [{ ...DEFAULT_VALUE_DIVISION }];
          currLocationList = [{ ...DEFAULT_VALUE_LOCATION }];
        }

        if (currDivisionList.length <= 0) {
          currDivisionList = [{ ...DEFAULT_VALUE_DIVISION }];
        }
        if (currLocationList.length <= 0) {
          currLocationList = [{ ...DEFAULT_VALUE_LOCATION }];
        }

        if (filterLocationList.length > 0) {
          locId = Number(filterLocationList[0].LOCN_ID);
          orgId = Number(filterLocationList[0].ORG_ID);
          unitId = Number(filterLocationList[0].UNIT_ID);
          currDivisionList = [
            ...currDivisionList.filter(
              (div) =>
                div.LOCN_ID === locId &&
                +div.SOS_ORG_ID === orgId &&
                +div.SOS_UNIT_ID === unitId,
            ),
          ];
        }
      } else {
        currDivisionList = [{ ...DEFAULT_VALUE_DIVISION }];
        currLocationList = [{ ...DEFAULT_VALUE_LOCATION }];
      }
      setFilterCompiledOrgData({
        locations: [...currLocationList],
        divisions: [...currDivisionList],
      });
    }
  }, [orgFilterData, isOrgFilterDataLoading, isOrgFilterDataError]);

  // useEffect(() => {
  //   if (
  //     !isOrgFilterDataLoading &&
  //     filtercompiledOrgData.locations &&
  //     filtercompiledOrgData.locations.length > 0
  //   ) {
  //     let currLocnList = [...filtercompiledOrgData.locations];
  //     if (authState.ROLES.includes(2)) {
  //       currLocnList = [...currLocnList];
  //     }
  //     setFilterLocationList(currLocnList);
  //     let currLocnId = 0;
  //     if (
  //       filtercompiledOrgData.locations.some(
  //         (location) => location.ID === authState.BASE_LOCN_ID,
  //       )
  //     ) {
  //       currLocnId = authState.BASE_LOCN_ID;
  //     } else {
  //       currLocnId = currLocnList[0].ID;
  //     }

  //     setFilterLocationId(currLocnId);
  //   }
  // }, [filtercompiledOrgData]);

  useEffect(() => {
    if (
      !isOrgFilterDataLoading &&
      filtercompiledOrgData.locations &&
      filtercompiledOrgData.locations.length > 0
    ) {
      let currLocnList = [...filtercompiledOrgData.locations];
      if (authState.ROLES.includes(2)) {
        currLocnList = [...currLocnList];
      }
      let currLocnId = 0;

      if (filterLocationId > 0) {
        currLocnId = filterLocationId;
      } else {
        currLocnId = filtercompiledOrgData.locations.some(
          (location) => location.ID === authState.BASE_LOCN_ID,
        )
          ? authState.BASE_LOCN_ID
          : filtercompiledOrgData.locations[0].ID;
      }
      setFilterLocationId(currLocnId);
      setFilterLocationList(currLocnList);
    }
  }, [filtercompiledOrgData]);

  useEffect(() => {
    if (
      !isOrgFilterDataLoading &&
      filterLocationId !== -2 &&
      filterLocationId !== -1 &&
      filtercompiledOrgData
    ) {
      let currDivisionList = [...filtercompiledOrgData.divisions];

      // for all dont filter

      if (filterLocationId > 0) {
        currDivisionList = currDivisionList.filter(
          (item) => item.LOCN_ID === filterLocationId,
        );
      }

      if (currDivisionList && currDivisionList.length <= 0) {
        currDivisionList = [{ ...DEFAULT_VALUE_DIVISION }];
      }

      if (currDivisionList && currDivisionList.length > 0) {
        if (authState.ROLES.includes(2) || authState.ROLES.includes(10)) {
          currDivisionList = [...currDivisionList];
        }
      }

      setFilterDivisionList([...currDivisionList]);
      setFilterDivisionId(currDivisionList[0].ID);
    }
  }, [filterLocationId, filtercompiledOrgData]);

  const {
    data: moderatorData,
    isLoading: isModeratorDataLoading,
    isError: isModeratorDataError,
  } = useVocModeratorDataQuery(divisionId, locationId);

  useEffect(() => {
    if (isModeratorDataLoading) {
      loader.show();
    } else {
      loader.hide();
    }
    if (!isModeratorDataLoading && isModeratorDataError) {
      alertToast.show("error", "Error Reading API", true);
    }
    if (!isModeratorDataLoading && !isModeratorDataError && moderatorData) {
      const historyLogVocModeratorData = [
        ...moderatorData.historyLogVocModeratorData,
      ];

      setModeratorMapData({
        historyLogVocModeratorData,
      });
    }
  }, [moderatorData, isModeratorDataLoading, isModeratorDataError]);

  const getUserOptionList = (inputText: string) => {
    getVocModeratorList(inputText, watchValues("LOCN_ID")).then((res) => {
      if (res.data.length > 0) {
        setUserOptionList([...res.data]);
      } else {
        getSapUser(inputText, watchValues("LOCN_ID")).then((sapresponse) => {
          if (sapresponse.data !== "notSapUser") {
            getVocModeratorList(inputText, watchValues("LOCN_ID")).then(
              (userResult) => {
                if (userResult.data.length > 0) {
                  setUserOptionList([...userResult.data]);
                } else {
                  setUserOptionList([]);
                }
              },
            );
          }
        });
      }
    });
  };

  const debounceFn = useCallback(debounce(getUserOptionList, 100), [
    globalState.teamId,
  ]);
  useEffect(() => {
    if (searchText.length > 2) {
      debounceFn(searchText);
    } else {
      setUserOptionList([]);
    }
  }, [searchText]);

  const indexOfLastUser = currentPage * vocPerPage;
  const indexOfFirstUser = indexOfLastUser - vocPerPage;
  const currentVocMod =
    moderatorMapData &&
    moderatorMapData.historyLogVocModeratorData &&
    moderatorMapData.historyLogVocModeratorData.length > 0
      ? moderatorMapData.historyLogVocModeratorData.slice(
          indexOfFirstUser,
          indexOfLastUser,
        )
      : [];
  const pageNumbers: number[] = [];

  for (
    let i = 1;
    i <=
    Math.ceil(moderatorMapData.historyLogVocModeratorData.length / vocPerPage);
    i += 1
  ) {
    pageNumbers.push(i);
  }

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

  return (
    <div
      className={`relative w-full h-full grid grid-rows-[auto_1fr_auto] gap-2.5 overflow-auto ${appModePaddingClass} `}
    >
      <div className="h-[50px] flex justify-between items-center p-1.5 px-2.5 border-[1px] text-md font-semibold text-center bg-[#f0f8ff] rounded-lg shadow-md dark:bg-gray-600 dark:text-cyan-200 dark:border-gray-500">
        <div className="flex items-center justify-start gap-2">
          <div className="flex w-[160px] justify-start items-center">
            <div className="mr-4 text-sm text-gray-400 dark:text-gray-300">
              Loc -{" "}
            </div>
            <div>
              <Select
                value={locationId}
                onChange={(e) => {
                  handleLocationChange(+e.target.value);
                }}
                size="sm"
                className="bg-transparent"
              >
                {locationList.map((locn) => (
                  <option key={locn.ID} value={locn.ID}>
                    {locn.NAME}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className=" w-[300px] flex justify-start items-center">
            <div className="mr-4 text-sm text-gray-400 dark:text-gray-300">
              Div -{" "}
            </div>
            <div>
              <Select
                value={divisionId}
                onChange={(e) => {
                  setDivisionId(+e.target.value);
                }}
                size="sm"
                className="bg-transparent"
              >
                {divisionList.map((div) => (
                  <option key={div.ID} value={div.ID}>
                    {div.NAME}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div className="w-[200px] flex justify-end items-center gap-4">
          {isEditAllowed && (
            <IconButton onClick={handleAddIteam}>
              <PlusIcon className="w-4 h-4" />
            </IconButton>
          )}
          <IconButton onClick={handleRefresh}>
            <ArrowPathIcon className="w-4 h-4" />
          </IconButton>
        </div>
      </div>
      {moderatorMapData.historyLogVocModeratorData &&
      moderatorMapData.historyLogVocModeratorData.length <= 0 ? (
        <AlertInfo heading="No Record Found" message="No data found" />
      ) : (
        <>
          <div className="h-full overflow-auto border-[1px] dark:border-gray-700">
            <table className="min-w-[99.9%] text-sm text-left text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  {tableColumns.map((col) => (
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
                {currentVocMod.map((row) => (
                  <tr
                    key={`${row.ID}`}
                    className="border-[1px] bg-white dark:bg-gray-800 dark:border-gray-700  "
                  >
                    {tableColumns.map((col) => (
                      <td
                        key={`${row.ID}_${col.dbCol}`}
                        className="px-6 py-4 font-normal text-cyan-700 whitespace-nowrap dark:text-white "
                      >
                        {" "}
                        {col.label === "Action" ? (
                          <div className="grid grid-cols-[auto_1fr] gap-1.5">
                            {renderDelete(row.USER_ID, row.DIV_ID)}
                          </div>
                        ) : (
                          row[col.dbCol as keyof IGetVocModeratorMappedData]
                        )}
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
                {pageNumbers.map((page) =>
                  renderPaginationButton(page, "Normal"),
                )}
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
        </>
      )}
      <ModalPopup
        heading="Add VOC Moderator"
        onClose={handleDialogClose}
        openStatus={showAddDialog.status}
        hasSubmit
        onSubmit={() => {
          handleSubmit(handleFormSubmit)();
        }}
        size="medium"
        showError
        hasError={!(Object.keys(errors).length === 0) && submitCount > 0}
      >
        <form className="bg-[#ecf3f9] dark:bg-gray-600">
          <div className="p-2 basis-full md:basis-1/2">
            <p className="p-2 text-sm text-black">Location</p>
            <Select
              value={filterLocationId}
              onChange={(e) => {
                setFilterLocationId(+e.target.value);
                setValue("LOCN_ID", +e.target.value, {
                  shouldValidate: true,
                });
              }}
            >
              {" "}
              {filterLocationList.map((locn) => (
                <option key={locn.ID} value={locn.ID}>
                  {locn.NAME}
                </option>
              ))}
            </Select>
          </div>
          <div className="p-2 basis-full md:basis-1/2">
            <p className="p-2 text-sm text-black">Division</p>
            <Select
              value={filterDivisionId}
              onChange={(e) => {
                setFilterDivisionId(+e.target.value);
                setValue("DIV_ID", +e.target.value, {
                  shouldValidate: true,
                });
              }}
            >
              {" "}
              {filterDivisionList.map((div) => (
                <option key={div.ID} value={div.ID}>
                  {div.NAME}
                </option>
              ))}
            </Select>
          </div>

          <div className="p-2 basis-full md:basis-1/2">
            <p className="p-2 text-sm text-black">Select User</p>
            <SelectSearchable
              optionList={[...userOptionList]}
              defaultSelectValue="Select User"
              selectedValue={`${getValues("USER_NAME")}`}
              searchText={searchText}
              searchTextChangeHandler={(data) => {
                setSearchText(data);
              }}
              onChange={(value: IOptionList) => {
                setValue("USER_ID", +value.id, {
                  shouldValidate: true,
                });
                setValue("USER_NAME", value.name, {
                  shouldValidate: true,
                });
              }}
              className="mt-2"
            />
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

export default VocModeratorMapping;
