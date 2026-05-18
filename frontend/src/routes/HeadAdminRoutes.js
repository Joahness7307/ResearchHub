import React from "react";
import { Route } from "react-router-dom";
import HeadAdminDashboard from "../components/Dashboard/HeadAdminDashboard";
import ProjectDetails from "../components/Research/ProjectDetails";
import NotificationPage from "../components/Dashboard/NotificationPage";
import NotificationDetails from "../components/Dashboard/NotificationDetails";

const headAdminRoutes = (
  <>
    <Route index element={<HeadAdminDashboard section="dashboard" />} />
    <Route path="pending-projects" element={<HeadAdminDashboard section="pending" />} />
    <Route path="approved-projects" element={<HeadAdminDashboard section="approved" />} />
    <Route path="request-for-revision" element={<HeadAdminDashboard section="revision" />} />
    <Route path="repository" element={<HeadAdminDashboard section="repository" />} />
    <Route path="notifications" element={<NotificationPage />} />
    <Route path="notifications/:id" element={<NotificationDetails />} />
    <Route path="projects/:id" element={<ProjectDetails />} />
  </>
);

export default headAdminRoutes;