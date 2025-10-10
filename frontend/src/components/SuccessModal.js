import React from "react";
import "./Research/SubmitResearch.css";

const SuccessModal = ({ show, onClose, message }) => {
  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Success!</h2>
        <div className="modal-desc">{message || "Project uploaded successfully."}</div>
        <button className="success-message" onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default SuccessModal;  