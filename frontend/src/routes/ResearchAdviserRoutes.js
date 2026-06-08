import React from "react";
import { Route } from "react-router-dom";
import ResearchAdviserDashboard from "../components/Dashboard/ResearchAdviserDashboard";
import ProjectDetails from "../components/Research/ProjectDetails";
import NotificationPage from "../components/Dashboard/NotificationPage";
import NotificationDetails from "../components/Dashboard/NotificationDetails";

const researchAdviserRoutes = (
  <>
    <Route index element={<ResearchAdviserDashboard section="dashboard" />} />
    <Route path="pending-projects" element={<ResearchAdviserDashboard section="pending" />} />
    <Route path="endorsed-projects" element={<ResearchAdviserDashboard section="endorsed" />} />
    <Route path="approved-projects" element={<ResearchAdviserDashboard section="approved" />} />
    <Route path="request-for-revision" element={<ResearchAdviserDashboard section="request-for-revision" />} />
    <Route path="repository" element={<ResearchAdviserDashboard section="repository" />} />
    <Route path="notifications" element={<NotificationPage />} />
    <Route path="notifications/:id" element={<NotificationDetails />} />
    <Route path="projects/:id" element={<ProjectDetails />} />
  </>
);

export default researchAdviserRoutes;