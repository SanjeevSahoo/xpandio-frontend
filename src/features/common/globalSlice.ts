import { createSlice } from "@reduxjs/toolkit";
import { IGlobalConfig } from "@/features/common/types";
import {
  DEFAULT_VALUE_LOCATION,
  DEFAULT_VALUE_DIVISION,
  DEFAULT_VALUE_AREA,
  DEFAULT_VALUE_TEAM,
} from "./constants";

const initialState: IGlobalConfig = {
  loginType: "Domain",
  appMode: "Normal",
  locationId: -1,
  divisionId: -1,
  areaId: -1,
  stationId: "",
  teamId: -1,
  teamsCount: -1,
  currTeam: { ...DEFAULT_VALUE_TEAM },
  currTeamMemberList: [],
  currArea: { ...DEFAULT_VALUE_AREA },
  currDivision: { ...DEFAULT_VALUE_DIVISION },
  currLocation: { ...DEFAULT_VALUE_LOCATION },
  lastSelection: {
    mode: "auto",
    locationId: -1,
    divisionId: -1,
    areaId: -1,
    stationId: "",
    teamId: -1,
  },
  roleTypes: [],
};
const globalSlice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setLoginType: (state, action) => {
      state.loginType = action.payload;
    },
    setHirarchy: (state, action) => {
      state.locationId = action.payload.locationId;
      state.divisionId = action.payload.divisionId;
      state.areaId = action.payload.areaId;
      state.stationId = action.payload.stationId;
      state.teamId = action.payload.teamId;
      state.teamsCount = action.payload.teamsCount;
      state.currTeam = action.payload.currTeam;
      state.currTeamMemberList = action.payload.currTeamMemberList;
      state.currArea = action.payload.currArea;
      state.currDivision = action.payload.currDivision;
      state.currLocation = action.payload.currLocation;
      state.roleTypes = action.payload.roleTypes;
    },
    setStation: (state, action) => {
      state.stationId = action.payload;
    },
    setAppMode: (state, action) => {
      state.appMode = action.payload;
    },
    setLastSelection: (state, action) => {
      state.lastSelection.mode = action.payload.mode;
      state.lastSelection.locationId = action.payload.locationId;
      state.lastSelection.divisionId = action.payload.divisionId;
      state.lastSelection.areaId = action.payload.areaId;
      state.lastSelection.stationId = action.payload.stationId;
      state.lastSelection.teamId = action.payload.teamId;
    },
  },
});

export const {
  setLoginType,
  setHirarchy,
  setAppMode,
  setStation,
  setLastSelection,
} = globalSlice.actions;

export default globalSlice.reducer;
