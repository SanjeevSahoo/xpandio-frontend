import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { shallowEqual } from "react-redux";
import { SubmitHandler, useForm } from "react-hook-form";
import { t } from "i18next";
import { useQueryClient } from "react-query";
import { useAlertConfig, useLoaderConfig } from "@/features/ui/hooks";
import { useAppSelector } from "@/store/hooks";
import { useUserDBQuery } from "@/features/common/hooks";
import { IUserFilter, IUserProfileEdit } from "@/features/users/types";
import { IOptionList } from "@/features/ui/types";
import useUserDetailsQuery from "@/features/users/hooks/useUserDetailsQuery";
import { DropdownList, TextField } from "@/features/ui/form";
import { API_BASE_URL, ASSET_BASE_URL } from "@/features/common/constants";
import { updateUserProfile } from "@/features/users/services/user.service";
import { Button } from "@/features/ui/buttons";

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
  SHOW_ADMIN_COL: 1,
  SHOW_ROLES: 1,
  IN_ROLE: 1,
  IN_ROLE_LIST: [],
  IN_MAPPING: 1,
  IN_MAPPING_LIST: [],
  ALLOWED_DOMAIN_LOGIN: "All",
  IS_FILTER_QUERY: 0,
};

const initialEditValues: IUserProfileEdit = {
  ID: 0,
  EMP_ID: "",
  EMP_NAME: "",
  SAP_STATUS: "",
  BASE_LOCN_ID: 0,
  BASE_LOCN_NAME: "",
  PERSONNEL_SUBAREA: "",
  EMP_TYPE: "",
  GENDER: "",
  PROFILE_PIC_URL: "", // edit
  EMAIL: "",
  SDT_TEAM_NAME: "",
  SDT_TEAM_AREA: "",
  SDT_TEAM_DIVISION: "",
  MOBILE: "", // edit
  USERNAME: "",
  GRADE: "",
  DESIGNATION: "",
  ROLES: "",
  RFID: "",
  ALLOWED_DOMAIN_LOGIN: "0",
  LOCATIONS: "",
  IS_RFID_RESET: 0,
  IS_PASSWORD_RESET: 0,
  IS_PROFILE_EDIT: 0,
};
function UserProfile() {
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
  const [filterList, setFilterList] = useState<IUserFilter>({
    ...initialFilterValues,
  });

  const appModePaddingClass =
    globalState.appMode === "FullScreen" ? "p-0 px-2.5 " : " p-2.5  pb-0 ";

  const {
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    control: controlEdit,
    formState: formStateEdit,
    getValues: getValuesEdit,
    setValue: setValueEdit,
  } = useForm<IUserProfileEdit>({
    defaultValues: initialEditValues,
  });

  const { submitCount: submitCountEdit, errors: errorsEdit } = formStateEdit;
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
  } = useUserDetailsQuery(
    authState.TICKET_NO,
    authState.BASE_LOCN_ID,
    filterList,
  );

  useEffect(() => {
    if (isUserDetailsDataLoading) {
      loader.show();
    } else {
      loader.hide();
    }

    if (!isUserDetailsDataLoading && isUserDetailsDataError) {
      alertToast.show("error", "Error Reading API", true);
    }
    if (userDetailsData && userDetailsData.length > 0) {
      resetEdit({ ...userDetailsData[0] });
    }
  }, [userDetailsData, isUserDetailsDataLoading, isUserDetailsDataError]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        query.queryKey[0] === "userDBQuery" ||
        query.queryKey[0] === "userDetailsQuery",
    });
  };
  const handleEditFormSubmit: SubmitHandler<IUserProfileEdit> = (values) => {
    loader.show();
    updateUserProfile(values)
      .then(() => {
        alertToast.show("success", "Data Updated Succesfully", true, 2000);
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
  return (
    <div
      className={`relative w-full h-full grid grid-rows-[auto_1fr_auto] gap-2.5 overflow-auto ${appModePaddingClass} `}
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
                  disabled
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
                <TextField
                  disabled
                  name="EMAIL"
                  label="Email"
                  control={controlEdit}
                />
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
                  disabled
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
                <TextField name="MOBILE" label="Mobile" control={controlEdit} />
              </div>
              <div className="p-2 basis-full lg:basis-2/4">
                <TextField
                  disabled
                  name="DESIGNATION"
                  label="Designation"
                  control={controlEdit}
                />
              </div>
              <div className="p-2 basis-full lg:basis-1/4" />
            </div>
            <div className="grid h-full gap-4 overflow-auto">
              <div className="h-full flex flex-wrap justify-evenly items-center p-4 border-[1px]  border-gray-300 rounded-lg dark:border-gray-500 overflow-auto">
                <div className="h-full w-full grid grid-rows-[auto_1fr] overflow-auto">
                  <div className="h-[35px] text-sm font-semibold text-cyan-700 dark:text-cyan-200 text-center">
                    User Roles
                  </div>
                  <div className="h-full overflow-auto bg-gray-50 dark:bg-gray-700">
                    <div className=" p-4 basis-full grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))]  gap-4 items-start  justify-evenly overflow-auto">
                      {dbList.roleList
                        .filter((item) => getUserRoleCheckStatus(+item.id))
                        .map((role) => (
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
                                disabled
                                type="checkbox"
                                checked
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
            <div className=" flex flex-wrap justify-evenly items-center p-4 border-[1px]  border-gray-300 rounded-lg dark:border-gray-500 overflow-auto">
              <div className="h-full w-full grid grid-rows-[auto_1fr] overflow-auto">
                <div className="h-[35px] text-sm font-semibold text-cyan-700 dark:text-cyan-200 text-center">
                  User Locations
                </div>
                <div className="overflow-auto bg-gray-50 dark:bg-gray-700">
                  <div className="p-4 basis-full grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))]  gap-2  items-start justify-evenly overflow-auto">
                    {dbList.allLocnList
                      .filter((item) => getUserLocationCheckStatus(+item.id))
                      .map((location) => (
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
                              disabled
                              checked
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
      <div className="flex items-center border-[1px] border-gray-200 rounded-lg p-2.5   dark:border-gray-500 dark:bg-gray-800">
        <Button
          onClick={() => {
            handleSubmitEdit(handleEditFormSubmit)();
          }}
          btnType="primary"
        >
          Submit
        </Button>
        {!(Object.keys(errorsEdit).length === 0) && submitCountEdit > 0 && (
          <p className="ml-auto text-xs font-semibold text-red-500">
            One or More Errors, Check field for Details.
          </p>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
