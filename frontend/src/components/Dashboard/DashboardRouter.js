import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

import StudentDashboard from "./StudentDashboard";
import GuestDashboard from "./GuestDashboard";
import AdminLayout from "../Layout/AdminLayout";
import ResearchAdviserLayout from "../Layout/ResearchAdviserLayout";
import HeadAdminLayout from "../Layout/HeadAdminLayout";
import ResearchAdviserDashboard from "./ResearchAdviserDashboard";
import HeadAdminDashboard from "./HeadAdminDashboard";
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
    case "head_admin":
      return <HeadAdminLayout>
                <HeadAdminDashboard />
              </HeadAdminLayout>;
    case "admin":
      return <AdminLayout>
                <AdminDashboard />
              </AdminLayout>;

    default:
      return <div>Unauthorized</div>;

  }
};

export default DashboardRouter;