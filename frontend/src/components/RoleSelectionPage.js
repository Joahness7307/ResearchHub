import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Auth/AuthForm.css";

const RoleSelection = () => {
  const navigate = useNavigate();
  const [studentPrompt, setStudentPrompt] = useState(false);

  const handleSelect = (role) => {
    if (role === "user") {
      navigate("/register-user");
    } else if (role === "student") {
      setStudentPrompt(true);
    }
  };

  const handleStudentType = (type) => {
    if (type === "college") {
      navigate("/register");
    } else if (type === "seniorhigh") {
      navigate("/register-seniorhigh");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-signup-form role-selection-form">
        <h2>Get Started</h2>
        <p className="subtext">Choose your role to continue</p>
        {!studentPrompt ? (
          <>
            <button className="role-btn" onClick={() => handleSelect("student")}>
              Signup as Student
            </button>
            <button className="role-btn" onClick={() => handleSelect("user")}>
              Signup as Guest 
            </button>
            <div className="auth-switch" style={{ marginTop: '20px' }}>
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </>
        ) : (
          <>
            <button className="role-btn" onClick={() => handleStudentType("college")}>
              College Student
            </button>
            <button className="role-btn" onClick={() => handleStudentType("seniorhigh")}>
              Senior High Student
            </button>
            <div>
              <button 
                type="button" 
                onClick={() => setStudentPrompt(false)} 
                className="back-btn"
              >
                Back
              </button>
              <div className="auth-switch" style={{ marginTop: '20px' }}>
              Already have an account? <Link to="/login">Login</Link>
            </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoleSelection;