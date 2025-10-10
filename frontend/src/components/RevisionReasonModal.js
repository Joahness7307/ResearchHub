import React, { useState } from "react";
import "./Research/ProjectDetails.css";

const RevisionReasonModal = ({ show, onClose, onSubmit }) => {
  const [reason, setReason] = useState("");
  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">Need Revision</h2>
        <div className="modal-desc">Please provide a reason for revision:</div>
        <textarea
          className="modal-textarea"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="Enter reason..."
          rows={4}
        />
        <div style={{ marginTop: 16 }}>
          <button
            className="modal-btn"
            onClick={() => {
              if (reason.trim()) onSubmit(reason);
            }}
            disabled={!reason.trim()}
          >
            Submit
          </button>
          <button className="modal-btn reject" onClick={onClose} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevisionReasonModal;