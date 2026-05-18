import React from "react";
import { Route } from "react-router-dom";
import Home from "../components/Home";
import Login from "../components/Auth/Login";
import CollegeSignup from "../components/Auth/CollegeSignup";
import RoleSelection from "../components/Auth/RoleSelectionPage";
import GuestSignup from "../components/Auth/GuestSignup";
import SeniorHighSignup from "../components/Auth/SeniorHighSignup";
import RedirectIfAuthenticated from "../components/RedirectIfAuthenticated";

const publicRoutes = (
  <>
    <Route
      path="/"
      element={
        <RedirectIfAuthenticated>
          <Home />
        </RedirectIfAuthenticated>
      }
    />
    <Route
      path="/login"
      element={
        <RedirectIfAuthenticated>
          <Login />
        </RedirectIfAuthenticated>
      }
    />
    <Route path="/role-selection" element={<RoleSelection />} />
    <Route
      path="/college-signup"
      element={
        <RedirectIfAuthenticated>
          <CollegeSignup />
        </RedirectIfAuthenticated>
      }
    />
    <Route
      path="/senior-high-signup"
      element={
        <RedirectIfAuthenticated>
          <SeniorHighSignup />
        </RedirectIfAuthenticated>
      }
    />
    <Route
      path="/guest-signup"
      element={
        <RedirectIfAuthenticated>
          <GuestSignup />
        </RedirectIfAuthenticated>
      }
    />
  </>
);

export default publicRoutes;
