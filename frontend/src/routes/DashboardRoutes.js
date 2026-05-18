import React from "react";
import { Outlet, Route } from "react-router-dom";
import DashboardRouter from "../components/Dashboard/DashboardRouter";
import ProtectedRoute from "./ProtectedRoute";

const DASHBOARD_ALLOWED_ROLES = ["student", "guest", "research_adviser", "head_admin", "admin"];

function DashboardProtectedLayout() {
  return (
    <ProtectedRoute allowedRoles={DASHBOARD_ALLOWED_ROLES}>
      <Outlet />
    </ProtectedRoute>
  );
}

const dashboardRoutes = (
  <Route path="/dashboard/*" element={<DashboardProtectedLayout />}>
    <Route index element={<DashboardRouter />} />
  </Route>
);

export default dashboardRoutes;
