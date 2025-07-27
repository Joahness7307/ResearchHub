import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "../../api/axios";
import { useNavigate } from "react-router-dom";
import "./MyAccount.css";

const MyAccount = () => {
  const { user, login } = useContext(AuthContext);
  const [papers, setPapers] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [editMessage, setEditMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const res = await axios.get("/users/my-papers");
        setPapers(res.data.papers || []);
      } catch {
        setPapers([]);
      }
    };
    if (user) fetchPapers();
  }, [user]);

  useEffect(() => {
    if (user) {
      setEditForm({ name: user.name, email: user.email });
    }
  }, [user]);

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

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

 const handleEditSubmit = async (e) => {
  e.preventDefault();
  setEditMessage("");
  try {
    await axios.put("/users/profile/update", {
      name: editForm.name,
      email: editForm.email
    });
    // Update context and localStorage
    login({ ...user, name: editForm.name, email: editForm.email }, localStorage.getItem("token"));
    setEditMessage("Profile updated successfully!");
    setEditing(false);
  } catch (err) {
    setEditMessage(err.response?.data?.message || "Failed to update profile.");
  }
};

  return (
    <div className="my-account two-column-layout">
      <div className="account-info-col">
        <div className="account-header">
          <div className="account-avatar">
            <span>
              {user?.name
                ? user.name
                    .split(" ")
                    .map(n => n[0])
                    .join("")
                    .toUpperCase()
                : "U"}
            </span>
          </div>
          <div className="account-info">
            <h2>{user?.name}</h2>
            <p className="account-role">{user?.role === "student" ? "Student" : user?.role}</p>
          </div>
        </div>
        <div className="account-details">
          {editing ? (
            <form className="edit-profile-form" onSubmit={handleEditSubmit}>
              <div className="account-detail-row">
                <span className="detail-label">Name:</span>
                <input
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="account-detail-row">
                <span className="detail-label">Email:</span>
                <input
                  name="email"
                  type="email"
                  value={editForm.email}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="edit-profile-actions">
                <button type="submit" className="edit-profile-btn">Save</button>
                <button type="button" className="edit-profile-cancel" onClick={() => setEditing(false)}>Cancel</button>
              </div>
              {editMessage && <div className="edit-profile-message">{editMessage}</div>}
            </form>
          ) : (
            <>
              <div className="account-detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{user?.email}</span>
              </div>
              <div className="account-detail-row">
                <span className="detail-label">Role:</span>
                <span className="detail-value">{user?.role}</span>
              </div>
              <button className="edit-profile-btn" onClick={() => setEditing(true)}>Edit Profile</button>
              {editMessage && <div className="edit-profile-message">{editMessage}</div>}
            </>
          )}
        </div>
      </div>
      <div className="account-papers-col">
        <div className="account-papers-section">
          <h3>My Submitted Research Papers</h3>
          {papers.length === 0 ? (
            <div className="no-papers">
              <p>No research papers submitted yet.</p>
            </div>
          ) : (
           <ul className="my-papers-list">
            {papers.map(paper => (
              <li key={paper.id} className="my-paper-item" onClick={() => navigate(`/projects/${paper.id}`)}>
                <div className="paper-title">{paper.title}</div>
                <div className="paper-meta">
                  <span 
                    className="paper-category"
                    style={{
                      background: customCategoryColors[paper.category] || "#2563eb",
                      color: "#fff"
                    }}
                  >
                    {paper.category}
                  </span>
                  <span className={`paper-status-badge status-${paper.status}`}>
                    {paper.status.charAt(0).toUpperCase() + paper.status.slice(1)}
                  </span>
                </div>
                <div className="paper-authors-row">
                  <span className="paper-authors-label"><b>Authors:</b></span>
                  <span className="paper-authors">{paper.authors}</span>
                </div>
                <div className="paper-abstract">
                  <b>Abstract:</b> {paper.abstract.length > 120 ? paper.abstract.slice(0, 120) + "..." : paper.abstract}
                </div>
                <div className="paper-actions">
                  <a
                    href={`${process.env.REACT_APP_BACKEND_URL}/${paper.documentPath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-pdf-btn"
                  >
                    View PDF
                  </a>
                  <span className="paper-date">
                    Uploaded: {new Date(paper.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyAccount;