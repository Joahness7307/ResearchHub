import React from "react";
import { Route } from "react-router-dom";
import ResearchCoordinatorDashboard from "../components/Dashboard/ResearchCoordinatorDashboard";
import ProjectDetails from "../components/Research/ProjectDetails";
import NotificationPage from "../components/Dashboard/NotificationPage";
import NotificationDetails from "../components/Dashboard/NotificationDetails";

const researchCoordinatorRoutes = (
  <>
    <Route index element={<ResearchCoordinatorDashboard section="dashboard" />} />
    <Route path="pending-projects" element={<ResearchCoordinatorDashboard section="pending" />} />
    <Route path="approved-projects" element={<ResearchCoordinatorDashboard section="approved" />} />
    <Route path="request-for-revision" element={<ResearchCoordinatorDashboard section="revision" />} />
    <Route path="repository" element={<ResearchCoordinatorDashboard section="repository" />} />
    <Route path="notifications" element={<NotificationPage />} />
    <Route path="notifications/:id" element={<NotificationDetails />} />
    <Route path="projects/:id" element={<ProjectDetails />} />
  </>
);

export default researchCoordinatorRoutes;