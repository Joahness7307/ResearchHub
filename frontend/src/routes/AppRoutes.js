import React from "react";
import { Navigate, Route } from "react-router-dom";
import AdminLayout from "../components/Layout/AdminLayout";
import HeadAdminLayout from "../components/Layout/HeadAdminLayout";
import ResearchAdviserLayout from "../components/Layout/ResearchAdviserLayout";
import publicRoutes from "./publicRoutes";
import sharedAuthenticatedRoutes from "./sharedAuthenticatedRoutes";
import adminRoutes from "./AdminRoutes";
import headAdminRoutes from "./HeadAdminRoutes";
import researchAdviserRoutes from "./ResearchAdviserRoutes";
import dashboardRoutes from "./DashboardRoutes";
import ProtectedRoute from "./ProtectedRoute";

const appRoutes = (
  <>
    {publicRoutes}

    {sharedAuthenticatedRoutes}

    <Route
      path="/admin/*"
      element={
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      {adminRoutes}
    </Route>

    <Route
      path="/head-admin/*"
      element={
        <ProtectedRoute allowedRoles={["head_admin"]}>
          <HeadAdminLayout />
        </ProtectedRoute>
      }
    >
      {headAdminRoutes}
    </Route>

    <Route
      path="/adviser/*"
      element={
        <ProtectedRoute allowedRoles={["research_adviser"]}>
          <ResearchAdviserLayout />
        </ProtectedRoute>
      }
    >
      {researchAdviserRoutes}
    </Route>

    {dashboardRoutes}

    <Route path="*" element={<Navigate to="/login" replace />} />
  </>
);

export default appRoutes;
