import React from "react";
import { Route } from "react-router-dom";
import SubmitResearch from "../components/Research/SubmitResearch";
import MyAccount from "../components/Dashboard/MyAccount";
import ProjectDetails from "../components/Research/ProjectDetails";
import AdminLayout from "../components/Layout/AdminLayout";
import MyAccountWithHeadAdminSidebar from "../components/Layout/MyAccountWithHeadAdminSidebar";
import MyAccountWithAdviserSidebar from "../components/Layout/MyAccountWithAdviserSidebar";
import NotificationPage from "../components/Dashboard/NotificationPage";
import NotificationDetails from "../components/Dashboard/NotificationDetails";
import SetupAccount from "../components/Dashboard/SetupAccount";
import ForceChangePassword from "../components/Auth/ForceChangePassword";
import { AuthContext } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";

const sharedAuthenticatedRoutes = (
  <>
    <Route
      path="/force-change-password"
      element={
        <ProtectedRoute>
          <ForceChangePassword />
        </ProtectedRoute>
      }
    />

    <Route
      path="/my-account"
      element={
        <ProtectedRoute allowedRoles={["admin", "head_admin", "student", "research_adviser", "guest"]}>
          <AuthContext.Consumer>
            {({ user }) =>
              user?.role === "admin" ? (
                <AdminLayout>
                  <MyAccount />
                </AdminLayout>
              ) : user?.role === "head_admin" ? (
                <MyAccountWithHeadAdminSidebar />
              ) : user?.role === "research_adviser" ? (
                <MyAccountWithAdviserSidebar />
              ) : (
                <MyAccount />
              )
            }
          </AuthContext.Consumer>
        </ProtectedRoute>
      }
    />

    <Route
      path="/upload-project"
      element={
        <ProtectedRoute allowedRoles={["student"]}>
          <AuthContext.Consumer>
            {({ user }) =>
              user &&
              ((user.year_level === "3rd" || user.year_level === "4th") || user.grade_level === "12") ? (
                <SubmitResearch />
              ) : (
                <div style={{ padding: "8rem", textAlign: "center", color: "#b33834" }}>
                  You are not eligible to submit a research project.
                </div>
              )
            }
          </AuthContext.Consumer>
        </ProtectedRoute>
      }
    />

    <Route
      path="/projects/:id"
      element={
        <ProtectedRoute allowedRoles={["student", "admin", "research_adviser", "guest"]}>
          <ProjectDetails />
        </ProtectedRoute>
      }
    />

    <Route
      path="/notifications/:id"
      element={
        <ProtectedRoute allowedRoles={["student", "admin", "head_admin", "research_adviser", "guest"]}>
          <NotificationDetails />
        </ProtectedRoute>
      }
    />

    <Route
      path="/notifications"
      element={
        <ProtectedRoute allowedRoles={["student", "admin", "guest"]}>
          <NotificationPage />
        </ProtectedRoute>
      }
    />

    <Route path="/setup-account" element={<SetupAccount />} />
  </>
);

export default sharedAuthenticatedRoutes;
