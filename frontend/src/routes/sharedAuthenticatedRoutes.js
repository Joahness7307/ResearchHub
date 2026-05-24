import React from "react";
import { Navigate, Route } from "react-router-dom";
import SubmitResearch from "../components/Research/SubmitResearch";
import MyAccount from "../components/Dashboard/MyAccount";
import ProjectDetails from "../components/Research/ProjectDetails";
import AdminLayout from "../components/Layout/AdminLayout";
import MyAccountWithHeadAdminSidebar from "../components/Layout/MyAccountWithHeadAdminSidebar";
import MyAccountWithAdviserSidebar from "../components/Layout/MyAccountWithAdviserSidebar";
import NotificationPage from "../components/Dashboard/NotificationPage";
import NotificationDetails from "../components/Dashboard/NotificationDetails";
import ForceChangePassword from "../components/Auth/ForceChangePassword";
import { AuthContext } from "../context/AuthContext";
import ProtectedRoute from "./ProtectedRoute";
import { isEligibleResearchStudent } from "../utils/studentEligibility";

const NotificationAccessGuard = ({ children }) => (
  <AuthContext.Consumer>
    {({ user }) => {
      if (user?.role === "student" && !isEligibleResearchStudent(user)) {
        return <Navigate to="/dashboard" replace />;
      }

      return children;
    }}
  </AuthContext.Consumer>
);

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
              isEligibleResearchStudent(user) ? (
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
        <ProtectedRoute allowedRoles={["student", "admin", "head_admin", "research_adviser"]}>
          <NotificationAccessGuard>
            <NotificationDetails />
          </NotificationAccessGuard>
        </ProtectedRoute>
      }
    />

    <Route
      path="/notifications"
      element={
        <ProtectedRoute allowedRoles={["student", "admin"]}>
          <NotificationAccessGuard>
            <NotificationPage />
          </NotificationAccessGuard>
        </ProtectedRoute>
      }
    />

  </>
);

export default sharedAuthenticatedRoutes;
