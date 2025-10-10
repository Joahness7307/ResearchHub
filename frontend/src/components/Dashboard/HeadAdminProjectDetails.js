import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import HeadAdminLayout from "../Layout/HeadAdminLayout";
import categoryColors from "../../constants/categoryColors";
import "../../components/Research/ProjectDetails.css";

const HeadAdminProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setProject(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleApprove = async () => {
    await axios.post(`/projects/admin/approve/${id}`);
    navigate("/head-admin/approved-projects");
  };

  const handleRequestRevision = async () => {
    await axios.post(`/projects/adviser/need-revision/${id}`);
    navigate("/head-admin/request-for-revision");
  };

  if (loading) return <HeadAdminLayout><div>Loading...</div></HeadAdminLayout>;
  if (!project) return <HeadAdminLayout><div>Project not found.</div></HeadAdminLayout>;

  return (
    <HeadAdminLayout>
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
    </HeadAdminLayout>
  );
};

export default HeadAdminProjectDetails;