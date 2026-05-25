import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

import StudentDashboard from "./StudentDashboard";
import GuestDashboard from "./GuestDashboard";
import AdminLayout from "../Layout/AdminLayout";
import ResearchAdviserLayout from "../Layout/ResearchAdviserLayout";
import ResearchCoordinatorLayout from "../Layout/ResearchCoordinatorLayout";
import ResearchAdviserDashboard from "./ResearchAdviserDashboard";
import ResearchCoordinatorDashboard from "./ResearchCoordinatorDashboard";
import AdminDashboard from "./AdminDashboard";

const DashboardRouter = () => {
  const { user } = useContext(AuthContext);

  switch (user?.role) {
    case "student":
      return <StudentDashboard />;
    case "guest":
      return <GuestDashboard />;
    case "research_adviser":
      return <ResearchAdviserLayout>
                <ResearchAdviserDashboard />
              </ResearchAdviserLayout>;
    case "research_coordinator":
      return <ResearchCoordinatorLayout>
                <ResearchCoordinatorDashboard />
              </ResearchCoordinatorLayout>;
    case "admin":
      return <AdminLayout>
                <AdminDashboard />
              </AdminLayout>;

    default:
      return <div>Unauthorized</div>;

  }
};

export default DashboardRouter;