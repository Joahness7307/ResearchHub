import React from "react";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import appRoutes from "./routes/AppRoutes";
import { NotificationProvider } from "./context/NotificationContext";

function App() {
  return (
    <Router>
      <NotificationProvider>
        <Navbar />
        <Routes>{appRoutes}</Routes>
      </NotificationProvider>
    </Router>
  );
}

export default App;
