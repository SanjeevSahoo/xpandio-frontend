import { IWeekData } from "@/features/common/types";
import { IOptionList } from "@/features/ui/types";

/* ENV Varibles */
const APP_VERSION = process.env.APP_VERSION || "1.0";
const BASENAME = process.env.REACT_APP_BASENAME || "";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "";
const ASSET_BASE_URL = process.env.REACT_APP_ASSET_BASE_URL || "";
const ENV_MODE = process.env.REACT_APP_ENV_MODE || "";
const CRYPTO_KEY = process.env.REACT_APP_CRYPTO_KEY || "";
const SOCKET_BASE_URL = process.env.REACT_APP_SOCKET_BASE_URL || "";

/* Genral Constants */

const FY_MONTH_LIST: IOptionList[] = [
  { id: 4, name: "April" },
  { id: 5, name: "May" },
  { id: 6, name: "June" },
  { id: 7, name: "July" },
  { id: 8, name: "August" },
  { id: 9, name: "September" },
  { id: 10, name: "October" },
  { id: 11, name: "November" },
  { id: 12, name: "December" },
  { id: 1, name: "January" },
  { id: 2, name: "February" },
  { id: 3, name: "March" },
];

const MONTH_4WEEK_LIST: IWeekData[] = [
  { id: 1, name: "Week 1", week_start: "01", week_end: "07" },
  { id: 2, name: "Week 2", week_start: "08", week_end: "14" },
  { id: 3, name: "Week 3", week_start: "15", week_end: "21" },
  { id: 4, name: "Week 4", week_start: "22", week_end: "28" },
];

const MONTH_5WEEK_LIST: IWeekData[] = [
  ...MONTH_4WEEK_LIST,
  { id: 5, name: "Week 5", week_start: "29", week_end: "31" },
];

const DAILY_SHIFTS: IOptionList[] = [
  { id: "A", name: "A" },
  { id: "B", name: "B" },
  { id: "C", name: "C" },
  { id: "G", name: "G" },
];

export {
  APP_VERSION,
  BASENAME,
  API_BASE_URL,
  ASSET_BASE_URL,
  ENV_MODE,
  CRYPTO_KEY,
  FY_MONTH_LIST,
  MONTH_4WEEK_LIST,
  MONTH_5WEEK_LIST,
  DAILY_SHIFTS,
  SOCKET_BASE_URL,
};
