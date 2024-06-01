import MASTER_MENU_LIST from "./master";

import { getFlatMenuList } from "../utils";

const APP_MENUS = [
  {
    appId: 1,
    routeMaster: "master",
    menuList: MASTER_MENU_LIST,
    menuFlatList: [...getFlatMenuList(MASTER_MENU_LIST)],
  },
];

export { MASTER_MENU_LIST, APP_MENUS };
