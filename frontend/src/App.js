// filepath: researchhub-frontend/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// Ensure AuthProvider and AuthContext are imported
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Home from "./components/Home";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import AdminDashboard from "./components/Dashboard/AdminDashboard";
import StudentDashboard from "./components/Dashboard/StudentDashboard";
import SubmitResearch from "./components/Research/SubmitResearch";
import MyAccount from "./components/Dashboard/MyAccount";
import Navbar from "./components/Layout/Navbar";
import ResearchDetails from "./components/Research/ResearchDetails";

// Modified ProtectedRoute component
const ProtectedRoute = ({ children, allowedRoles }) => {
  // Destructure 'loading' from AuthContext
  const { user, loading } = React.useContext(AuthContext);

  // If still loading the user session, show a loading message/spinner
  if (loading) {
    return <div>Loading authentication...</div>; // Or a more sophisticated spinner/component
  }

  // If not loading and no user, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }

  // If user exists but role not allowed, redirect to home (or unauthorized page)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // Or navigate to a specific unauthorized page
  }

  // If authenticated and authorized, render the children
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
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
                <SubmitResearch />
              </ProtectedRoute>
            }
          />
           <Route
            path="/projects/:id"
            element={
              <ProtectedRoute allowedRoles={["student", "admin"]}>
                <ResearchDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-account"
            element={
              <ProtectedRoute allowedRoles={["student", "admin"]}>
                <MyAccount />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;