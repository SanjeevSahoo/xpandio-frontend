import React from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import PrivateRoutes from "./features/authorization/PrivateRoute";

const AuthLayout = React.lazy(
  () => import("./features/layout/auth/AuthLayout"),
);
const HomeLayout = React.lazy(
  () => import("./features/layout/home/HomeLayout"),
);

const PageNotFound = React.lazy(() => import("@/pages/PageNotFound"));
const DomainLogin = React.lazy(() => import("@/pages/DomainLogin"));

// Master Routes

const MasterDashboard = React.lazy(() => import("@/pages/master/Dashboard"));
const Users = React.lazy(() => import("@/pages/master/administration/Users"));
const Menus = React.lazy(() => import("@/pages/master/administration/Menus"));
const Config = React.lazy(() => import("@/pages/master/administration/Config"));
const Locations = React.lazy(
  () => import("@/pages/master/administration/Locations"),
);
const Applications = React.lazy(
  () => import("@/pages/master/administration/Applications"),
);
const UserProfile = React.lazy(() => import("@/pages/master/UserProfile"));

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="auth" element={<AuthLayout />}>
          <Route index element={<DomainLogin />} />
          <Route path="domain-login" element={<DomainLogin />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
        <Route
          path="master"
          element={<PrivateRoutes outlet={<HomeLayout appId={1} />} />}
        >
          <Route index element={<MasterDashboard />} />
          <Route path="dashboard" element={<MasterDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="menus" element={<Menus />} />
          <Route path="config" element={<Config />} />
          <Route path="locations" element={<Locations />} />
          <Route path="applications" element={<Applications />} />
          <Route path="user-profile" element={<UserProfile />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
      <Outlet />
    </>
  );
}

export default App;
