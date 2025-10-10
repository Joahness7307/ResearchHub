import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "././Auth/AuthForm.css";

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
      <div className="auth-signup-form" style={{ maxWidth: 400, textAlign: "center" }}>
        <h2>Get Started</h2>
        <p className="subtext">Choose your role to continue</p>
        {!studentPrompt ? (
          <>
            <button style={{ marginBottom: 20 }} onClick={() => handleSelect("student")}>
              Signup as Student
            </button>
            <button onClick={() => handleSelect("user")}>
              Signup as Guest 
            </button>
            <div className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </div>
          </>
        ) : (
          <>
            <p style={{ marginBottom: 16 }}>Are you a College or Senior High student?</p>
            <button style={{ marginBottom: 12 }} onClick={() => handleStudentType("college")}>
              College Student
            </button>
            <button onClick={() => handleStudentType("seniorhigh")}>
              Senior High Student
            </button>
            <div style={{ marginTop: 20 }}>
              <button type="button" onClick={() => setStudentPrompt(false)} style={{ fontSize: 12 }}>
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RoleSelection;