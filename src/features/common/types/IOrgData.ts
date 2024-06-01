import { IOptionList } from "@/features/ui/types";
import ILocationItem from "./ILocationItem";
import IOrgItem from "./IOrgItem";
import ISDTTeam from "./ISDTTeam";
import ISDTTeamMember from "./ISDTTeamMember";
import IWISCoordinator from "./IWISCoodinator";
import IVOCModerator from "./IVOCModerator";

interface IOrgData {
  locations: ILocationItem[];
  divisions: IOrgItem[];
  areas: IOrgItem[];
  wisCoordinator: IWISCoordinator[];
  sdtTeams: ISDTTeam[];
  sdtTeamMembers: ISDTTeamMember[];
  roleTypes: IOptionList[];
  vocModerator: IVOCModerator[];
  stations: IOptionList[];
}

export default IOrgData;
