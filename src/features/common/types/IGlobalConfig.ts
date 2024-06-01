import { IOptionList } from "@/features/ui/types";
import ILastSelection from "./ILastSelection";
import ILocationItem from "./ILocationItem";
import IOrgItem from "./IOrgItem";
import ISDTTeam from "./ISDTTeam";
import ISDTTeamMember from "./ISDTTeamMember";

interface IGlobalConfig {
  loginType: string;
  appMode: string;
  locationId: number;
  divisionId: number;
  areaId: number;
  stationId: string;
  teamId: number;
  teamsCount: number;
  currTeam: ISDTTeam;
  currTeamMemberList: ISDTTeamMember[];
  currArea: IOrgItem;
  currDivision: IOrgItem;
  currLocation: ILocationItem;
  lastSelection: ILastSelection;
  roleTypes: IOptionList[];
}

export default IGlobalConfig;
