import React, { useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import "./ResearchDetails.css";

function ConfirmModal({ show, onConfirm, onCancel, action, rejectReason, setRejectReason }) {
  if (!show) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 className="modal-title">
          {action === "approve" ? "Approve Research?" : "Reject Research?"}
        </h2>
        <div className="modal-desc">
          Are you sure you want to {action} this research project?
        </div>
        {action === "reject" && (
          <textarea
            className="modal-textarea"
            placeholder="Enter reason for rejection (required)"
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            rows={3}
            required
            style={{ marginBottom: "1rem" }}
          />
        )}
        <button
          className="modal-btn approve"
          onClick={onConfirm}
          disabled={action === "reject" && !rejectReason.trim()}
        >
          Yes, {action.charAt(0).toUpperCase() + action.slice(1)}
        </button>
        <button
          className="modal-btn reject"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Custom colors for known categories
const customCategoryColors = {
  "Information Technology": "#38bdf8",
  "Computer Science": "#a3e635",
  "Education": "#fbbf24",
  "Business Administration": "#f472b6",
  "Accountancy": "#818cf8",
  "Hospitality and Tourism": "#fca311",
  "Engineering": "#34d399",
  "Health Sciences": "#f87171",
  "Social Sciences": "#f59e42",
  "Psychology": "#c084fc",
  "Communication and Media Studies": "#60a5fa"
};

// Fallback for dynamic categories
const generateColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 80%)`;
};

const ResearchDetails = () => {
  const { id } = useParams();
  const [paper, setPaper] = useState(null);
  const { user } = React.useContext(AuthContext);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(""); // "approve" or "reject"
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

const fetchComments = async () => {
  try {
    const res = await axios.get(`/comments/${id}`);
    setComments(res.data);
  } catch {
    setComments([]);
  }
};

useEffect(() => {
  fetchComments();
}, [id]);

const handleCommentSubmit = async (e) => {
  e.preventDefault();
  if (!commentContent.trim()) return;
  setCommentLoading(true);
  try {
    await axios.post(`/comments/${id}`, { content: commentContent });
    setCommentContent("");
    fetchComments();
  } catch {}
  setCommentLoading(false);
};

  useEffect(() => {
  axios.get(`/research/${id}`)
    .then(res => setPaper(res.data))
    .catch(() => setPaper(null));
}, [id]);

  if (!paper) {
    return (
      <div className="research-details-container">
        <h2>Research Paper Not Found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  const handleApprove = () => {
    setConfirmAction("approve");
    setShowConfirm(true);
  };
const handleReject = () => {
  setConfirmAction("reject");
  setShowConfirm(true);
  setRejectReason("");
};  
const handleConfirm = async () => {
  if (confirmAction === "approve") {
    await axios.post(`/research/admin/approve/${paper.id}`);
  } else if (confirmAction === "reject") {
    await axios.post(`/research/admin/reject/${paper.id}`, { reason: rejectReason });
  }
  setShowConfirm(false);
  window.location.reload();
};

  // Get color for category
  const categoryColor =
    customCategoryColors[paper.category] || generateColor(paper.category);

  return (
    <div className="research-details-container">
      <h2>{paper.title}</h2>
      <span
        className="category-badge"
        style={{ background: categoryColor }}
      >
        {paper.category}
      </span>
      <div className="research-meta">
        <p><b>Authors:</b> {paper.authors}</p>
        <span className="submission-date">
          Submitted: {new Date(paper.createdAt).toLocaleDateString()}
        </span>
      </div>
      <p><b>Abstract:</b> {paper.abstract}</p>
      <div className="details-actions">
        <a
          href={`${process.env.REACT_APP_BACKEND_URL}/${paper.documentPath}`}
          target="_blank"
          rel="noopener noreferrer"
          className="view-pdf-btn"
        >
          View PDF
        </a>
        <a
          href={`${process.env.REACT_APP_BACKEND_URL}/${paper.documentPath}`}
          download
          target="_blank"
          rel="noopener noreferrer"
          className="download-pdf-btn"
        >
          Download PDF
        </a>
      </div>

      {paper.status === "rejected" && paper.rejectionReason && (
  <div style={{
    background: "#ffe4e6",
    color: "#b33834",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1.5rem",
    fontWeight: 600
  }}>
    <b>Rejection Reason:</b> {paper.rejectionReason}
  </div>
)}

      {user && (
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <textarea
            value={commentContent}
            onChange={e => setCommentContent(e.target.value)}
            placeholder="Add a comment or feedback..."
            rows={3}
            disabled={commentLoading}
          />
          <button
            type="submit"
            disabled={commentLoading}
          >
            {commentLoading ? "Posting..." : "Post Comment"}
          </button>
        </form>
      )}

      {user && user.role === "admin" && (
        <div className="admin-actions">
          {paper.status === "pending" && (
            <>
              <button onClick={handleApprove}>Approve</button>
              <button className="reject" onClick={handleReject}>Reject</button>
              <ConfirmModal
                show={showConfirm}
                action={confirmAction}
                onConfirm={handleConfirm}
                onCancel={() => setShowConfirm(false)}
                rejectReason={rejectReason}
                setRejectReason={setRejectReason}
              />
            </>
          )}
        </div>
      )}

      <button onClick={() => navigate(-1)} className="back-btn">Back to Projects</button>

      <div className="comments-section">
        <h3>Comments & Feedback</h3>
        {comments.length === 0 ? (
          <div style={{ color: "#888", fontStyle: "italic" }}>No comments yet. Be the first to comment!</div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-card">
              <div className="comment-author">
                {comment.user?.name || "User"}
                <span className="comment-role">({comment.user?.role})</span>
              </div>
              <div className="comment-content">{comment.content}</div>
              <div className="comment-date">
                {new Date(comment.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};



export default ResearchDetails;