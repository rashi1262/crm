import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const PublicRoute = () => {
  const token = localStorage.getItem("Token");

  // if authenticate then redirect to dashboard page
  if (token) {
    return <Navigate to={"/dashboard"} />;
  }

  // this return statement in this if the token is not then the children of the public route  and try to access /login then it will refuse
  return <Outlet />;
};

export default PublicRoute;
