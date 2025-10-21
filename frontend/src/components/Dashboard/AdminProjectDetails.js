import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import categoryColors from "../../constants/categoryColors";
import "../../components/Research/ProjectDetails.css";

const AdminProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // axios instance already attaches token
    axios
      .get(`/projects/${id}`)
      .then((res) => {
        setProject(res.data);
      })
      .catch((err) => {
        console.error("Failed to load project:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    try {
      await axios.post(`/projects/admin/approve/${id}`);
      navigate("/admin/manage-projects");
    } catch (err) {
      console.error("Approve failed:", err);
      alert("Failed to approve project.");
    }
  };

  const handleRequestRevision = async () => {
    try {
      // research adviser endpoint kept for compatibility — adjust if route differs
      await axios.post(`/projects/adviser/need-revision/${id}`);
      navigate("/admin/manage-projects");
    } catch (err) {
      console.error("Request revision failed:", err);
      alert("Failed to request revision.");
    }
  };

  if (loading) return <div style={{ padding: "6rem" }}>Loading...</div>;
  if (!project) return <div style={{ padding: "6rem" }}>Project not found.</div>;

  return (
      <div className="project-details-page">
        <div className="research-details-container">
          <h2>{project.title}</h2>
          <span
            className="category-badge"
            style={{
              background: categoryColors[project.category] || "#2563eb",
              color: "#fff"
            }}
          >
            {project.category}
          </span>
          <div className="research-meta">
            <p><b>Authors:</b> {project.authors}</p>
            <span className="submission-date">
              Submitted: {new Date(project.created_at || project.created_at).toLocaleDateString()}
            </span>
          </div>
          <p><b>Description:</b> {project.title_description}</p>
          <p><b>Abstract:</b> {project.abstract}</p>
          <div className="details-actions">
            <a
              href={`/${project.documentPath}`}
              target="_blank"
              rel="noopener noreferrer"
              className="view-pdf-btn"
            >
              View PDF
            </a>
            <a
              href={`/${project.documentPath}`}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="download-pdf-btn"
            >
              Download PDF
            </a>
          </div>
          {project.status === "endorsed" && (
            <div className="adviser-actions" style={{ marginTop: "2rem", display: "flex", gap: "2rem" }}>
              <button className="admin-btn" onClick={handleApprove}>Approve</button>
              <button className="admin-btn cancel-btn" onClick={handleRequestRevision}>Request Revision</button>
            </div>
          )}
        </div>
      </div>
  );
};

export default AdminProjectDetails;