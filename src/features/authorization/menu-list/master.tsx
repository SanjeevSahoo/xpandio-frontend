import React from "react";

import HomeIcon from "@heroicons/react/24/outline/HomeIcon";
import HomeIconSolid from "@heroicons/react/24/solid/HomeIcon";
import AdjustmentsHorizontalIcon from "@heroicons/react/24/outline/AdjustmentsHorizontalIcon";
import AdjustmentsHorizontalIconSolid from "@heroicons/react/24/solid/AdjustmentsHorizontalIcon";
import UsersIcon from "@heroicons/react/24/outline/UsersIcon";
import UsersIconSolid from "@heroicons/react/24/solid/UsersIcon";
import ListBulletIcon from "@heroicons/react/24/outline/ListBulletIcon";
import ListBulletIconSolid from "@heroicons/react/24/solid/ListBulletIcon";
import UserCircleIcon from "@heroicons/react/24/outline/UserCircleIcon";
import UserCircleIconSolid from "@heroicons/react/24/solid/UserCircleIcon";
import MapPinIcon from "@heroicons/react/24/outline/MapPinIcon";
import MapPinIconSolid from "@heroicons/react/24/solid/MapPinIcon";
import {
  ChatBubbleOvalLeftEllipsisIcon,
  CogIcon,
  CubeTransparentIcon,
} from "@heroicons/react/24/outline";
import IMenuItem from "../types/IMenuItem";
import UserProfile from "@/pages/master/UserProfile";
import VocModeratorMapping from "@/pages/master/administration/VocModeratorMapping";

const Dashboard = React.lazy(() => import("@/pages/master/Dashboard"));
const SdtCommunications = React.lazy(
  () => import("@/pages/master/SdtCommunications"),
);
const Users = React.lazy(() => import("@/pages/master/administration/Users"));
const Menus = React.lazy(() => import("@/pages/master/administration/Menus"));
const Config = React.lazy(() => import("@/pages/master/administration/Config"));
const Locations = React.lazy(
  () => import("@/pages/master/administration/Locations"),
);
const Applications = React.lazy(
  () => import("@/pages/master/administration/Applications"),
);
const PageNotFound = React.lazy(() => import("@/pages/PageNotFound"));

const MASTER_MENU_LIST: IMenuItem[] = [
  {
    id: 1,
    name: "",
    icon: <HomeIcon className="w-5 h-5" />,
    iconSelected: <HomeIconSolid className="w-5 h-5" />,
    appId: 1,
    path: "",
    element: <Dashboard />,
    children: [],
    menuType: "Static",
  },
  {
    id: 1,
    name: "Dashboard",
    icon: <HomeIcon className="w-5 h-5" />,
    iconSelected: <HomeIconSolid className="w-5 h-5" />,
    appId: 1,
    path: "dashboard",
    element: <Dashboard />,
    children: [],
    menuType: "Normal",
  },
  {
    id: 2,
    name: "Administration",
    icon: <AdjustmentsHorizontalIcon className="w-5 h-5" />,
    iconSelected: <AdjustmentsHorizontalIconSolid className="w-5 h-5" />,
    appId: 1,
    path: "",
    element: null,
    children: [
      {
        id: 3,
        name: "Users",
        icon: <UsersIcon className="w-5 h-5" />,
        iconSelected: <UsersIconSolid className="w-5 h-5" />,
        appId: 1,
        path: "users",
        element: <Users />,
        children: [],
        menuType: "Normal",
      },
      {
        id: 4,
        name: "Menus",
        icon: <ListBulletIcon className="w-5 h-5" />,
        iconSelected: <ListBulletIconSolid className="w-5 h-5" />,
        appId: 1,
        path: "menus",
        element: <Menus />,
        children: [],
        menuType: "Normal",
      },
      {
        id: 6,
        name: "Config",
        icon: <CogIcon className="w-5 h-5" />,
        iconSelected: <CogIcon className="w-5 h-5" />,
        appId: 1,
        path: "config",
        element: <Config />,
        children: [],
        menuType: "Normal",
      },
      {
        id: 7,
        name: "Locations",
        icon: <MapPinIcon className="w-5 h-5" />,
        iconSelected: <MapPinIconSolid className="w-5 h-5" />,
        appId: 1,
        path: "locations",
        element: <Locations />,
        children: [],
        menuType: "Normal",
      },
      {
        id: 8,
        name: "Applications",
        icon: <CubeTransparentIcon className="w-5 h-5" />,
        iconSelected: <CubeTransparentIcon className="w-5 h-5" />,
        appId: 1,
        path: "applications",
        element: <Applications />,
        children: [],
        menuType: "Normal",
      },
      {
        id: 293,
        name: "VOC Moderator Mapping",
        icon: <UserCircleIcon className="w-5 h-5" />,
        iconSelected: <UserCircleIconSolid className="w-5 h-5" />,
        appId: 1,
        path: "voc-moderator-mapping",
        element: <VocModeratorMapping />,
        children: [],
        menuType: "Static",
      },
    ],
    menuType: "Normal",
  },
  {
    id: 5,
    name: "User Profile",
    icon: <UserCircleIcon className="w-5 h-5" />,
    iconSelected: <UserCircleIconSolid className="w-5 h-5" />,
    appId: 1,
    path: "user-profile",
    element: <UserProfile />,
    children: [],
    menuType: "Static",
  },
  {
    id: 296,
    name: "SDT Communications",
    icon: <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />,
    iconSelected: <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />,
    appId: 1,
    path: "sdt-communications",
    element: <SdtCommunications />,
    children: [],
    menuType: "Normal",
  },
  {
    id: 0,
    name: "",
    icon: <HomeIcon className="w-5 h-5" />,
    iconSelected: <HomeIconSolid className="w-5 h-5" />,
    appId: 1,
    path: "*",
    element: <PageNotFound />,
    children: [],
    menuType: "Static",
  },
];

export default MASTER_MENU_LIST;
