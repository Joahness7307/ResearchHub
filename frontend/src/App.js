import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import Home from "./components/Home";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import StudentDashboard from "./components/Dashboard/StudentDashboard";
import SubmitResearch from "./components/Research/SubmitResearch";
import MyAccount from "./components/Dashboard/MyAccount";
import Navbar from "./components/Layout/Navbar";
import ProjectDetails from "./components/Research/ProjectDetails";
import RoleSelection from "./components/RoleSelectionPage";
import GuestSignup from "./components/Auth/GuestSignup";
import SeniorHighSignup from "./components/Auth/SeniorHighSignup";
import NotificationPage from "./components/Dashboard/NotificationPage";
import AdminLayout from "./components/Layout/AdminLayout";
import SetupAccount from "./components/Dashboard/SetupAccount";
import ResearchAdviserDashboard from "./components/Dashboard/ResearchAdviserDashboard";
import ResearchAdviserLayout from "./components/Layout/ResearchAdviserLayout";
import HeadAdminDashboard from "./components/Dashboard/HeadAdminDashboard";
import MyAccountWithHeadAdminSidebar from "./components/Layout/MyAccountWithHeadAdminSidebar";
import GuestDashboard from "./components/Dashboard/GuestDashboard";
import NotificationDetails from "./components/Dashboard/NotificationDetails";
import HeadAdminLayout from "./components/Layout/HeadAdminLayout";
import MyAccountWithAdviserSidebar from "./components/Layout/MyAccountWithAdviserSidebar";
import ForceChangePassword from "./components/Auth/ForceChangePassword";
import RedirectIfAuthenticated from "./components/RedirectIfAuthenticated";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <div>Loading authentication...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to home or a "403 Forbidden" page — home is safest
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
      <Router>
        <Navbar />
        <Routes>
          <Route
            path="/"
            element={
              <RedirectIfAuthenticated>
                <Home />
              </RedirectIfAuthenticated>
            }
          />
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <Login />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuthenticated>
              <Signup />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/register-user"
          element={
            <RedirectIfAuthenticated>
              <GuestSignup />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/register-seniorhigh"
          element={
            <RedirectIfAuthenticated>
              <SeniorHighSignup />
            </RedirectIfAuthenticated>
          }
        />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route
            path="/force-change-password"
            element={
              <ProtectedRoute>
                <ForceChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminDashboard activeSection="users" />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/manage-projects"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminDashboard activeSection="projects" />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/academic"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <AdminDashboard activeSection="academic" />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/projects/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <ProjectDetails />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout>
                  <NotificationPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />

        <Route
          path="/head-admin"
          element={
              <ProtectedRoute allowedRoles={["head_admin"]}>
                  <HeadAdminLayout>
                      <HeadAdminDashboard section="dashboard" />
                  </HeadAdminLayout>
              </ProtectedRoute>
          }
          />
          <Route
              path="/head-admin/pending-projects"
              element={
                  <ProtectedRoute allowedRoles={["head_admin"]}>
                      <HeadAdminLayout>
                          <HeadAdminDashboard section="pending" />
                      </HeadAdminLayout>
                  </ProtectedRoute>
              }
          />
          <Route
              path="/head-admin/approved-projects"
              element={
                  <ProtectedRoute allowedRoles={["head_admin"]}>
                      <HeadAdminLayout>
                          <HeadAdminDashboard section="approved" />
                      </HeadAdminLayout>
                  </ProtectedRoute>
              }
          />
          <Route
              path="/head-admin/request-for-revision"
              element={
                  <ProtectedRoute allowedRoles={["head_admin"]}>
                      <HeadAdminLayout>
                          <HeadAdminDashboard section="revision" />
                      </HeadAdminLayout>
                  </ProtectedRoute>
              }
          />
          <Route
              path="/head-admin/repository"
              element={
                  <ProtectedRoute allowedRoles={["head_admin"]}>
                      <HeadAdminLayout>
                          <HeadAdminDashboard section="repository" />
                      </HeadAdminLayout>
                  </ProtectedRoute>
              }
          />
          <Route
              path="/head-admin/notifications"
              element={
                  <ProtectedRoute allowedRoles={["head_admin"]}>
                      <HeadAdminLayout>
                          <NotificationPage />
                      </HeadAdminLayout>
                  </ProtectedRoute>
              }
          />
          <Route
              path="/head-admin/projects/:id"
              element={
                  <ProtectedRoute allowedRoles={["head_admin"]}>
                      <HeadAdminLayout>
                          <ProjectDetails />
                      </HeadAdminLayout>
                  </ProtectedRoute>
              }
          />
          <Route
              path="/head-admin/notifications/:id"
              element={
                  <ProtectedRoute allowedRoles={["head_admin"]}>
                      <HeadAdminLayout>
                          <NotificationDetails />
                      </HeadAdminLayout>
                  </ProtectedRoute>
              }
          />


          <Route
            path="/guest"
            element={
              <ProtectedRoute allowedRoles={["guest"]}>
                <GuestDashboard />
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
            path="/projects"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/submit-research"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <AuthContext.Consumer>
                  {({ user }) =>
                    (user &&
                      ((user.year_level === "3rd" || user.year_level === "4th") ||
                      user.grade_level === "12")
                    ) ? (
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
          
          <Route path="/adviser/*" element={
            <ProtectedRoute allowedRoles={["research_adviser"]}>
            <ResearchAdviserLayout>
              <Routes>
                <Route path="" element={<ResearchAdviserDashboard section="dashboard" />} />
                <Route path="pending-projects" element={<ResearchAdviserDashboard section="pending" />} />
                <Route path="endorsed-projects" element={<ResearchAdviserDashboard section="endorsed" />} /> 
                <Route path="approved-projects" element={<ResearchAdviserDashboard section="approved" />} />
                <Route path="request-for-revision" element={<ResearchAdviserDashboard section="request-for-revision" />} />
                <Route path="repository" element={<ResearchAdviserDashboard section="repository" />} />
                <Route path="notifications" element={<NotificationPage />} />
                <Route path="notifications/:id" element={<NotificationDetails />} />
                <Route path="my-account" element={<MyAccount />} />
                <Route path="projects/:id" element={<ProjectDetails />} />
              </Routes>         
            </ResearchAdviserLayout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
  );
}

export default App;