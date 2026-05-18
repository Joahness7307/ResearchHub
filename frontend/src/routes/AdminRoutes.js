import React from "react";
import { Route } from "react-router-dom";
import AdminDashboard from "../components/Dashboard/AdminDashboard";
import ProjectDetails from "../components/Research/ProjectDetails";
import NotificationPage from "../components/Dashboard/NotificationPage";

const adminRoutes = (
  <>
    <Route index element={<AdminDashboard />} />
    <Route path="manage-users" element={<AdminDashboard activeSection="users" />} />
    <Route path="manage-projects" element={<AdminDashboard activeSection="projects" />} />
    <Route path="academic" element={<AdminDashboard activeSection="academic" />} />
    <Route path="projects/:id" element={<ProjectDetails />} />
    <Route path="notifications" element={<NotificationPage />} />
  </>
);

export default adminRoutes;