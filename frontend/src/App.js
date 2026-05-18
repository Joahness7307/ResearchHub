import React from "react";
import { BrowserRouter as Router, Routes } from "react-router-dom";
import Navbar from "./components/Layout/Navbar";
import appRoutes from "./routes/AppRoutes";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>{appRoutes}</Routes>
    </Router>
  );
}

export default App;
