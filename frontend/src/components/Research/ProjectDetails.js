// Modified frontend/ProjectDetails.js
import React, { useState, useEffect, useContext } from "react";
import axios from "../../api/axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import RevisionReasonModal from "../RevisionReasonModal";
import "./ProjectDetails.css";
import categoryColors from "../../constants/categoryColors";
import likeIcon from "../../assets/likeIcon.png";
import likedIcon from "../../assets/likedIcon.png";
import commentIcon from "../../assets/commentIcon.png";
import bookmarkIcon from "../../assets/bookmarkIcon.png";
import bookmarkedIcon from "../../assets/bookmarkedIcon.png";

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    // Only show icons for approved projects
    const showInteractionIcons = project && project.status === "approved";
    const { user } = useContext(AuthContext); // user can be null
    const [actionLoading, setActionLoading] = useState(false);
    const [showRevisionModal, setShowRevisionModal] = useState(false);

    const [showReuploadModal, setShowReuploadModal] = useState(false);
    const [reuploadFile, setReuploadFile] = useState(null);

    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState("");
    const [replyInputs, setReplyInputs] = useState({});

    const [likeData, setLikeData] = useState({ count: 0, liked: false });
    const [bookmarkData, setBookmarkData] = useState({ bookmarked: false });
    const [commentCount, setCommentCount] = useState(0);

    const navigate = useNavigate();
    const location = useLocation();

    const [editFields, setEditFields] = useState({
        title: "",
        title_description: "",
        abstract: "",
        category: ""
    });

    // Example handler for opening the edit modal
    const openEditModal = () => {
        setEditFields({
            title: project.title,
            title_description: project.title_description,
            abstract: project.abstract,
            category: project.category
        });
        // setShowEditModal(true); // If you use a modal
    };

    const handleEditMetadata = async () => {
        try {
            await axios.put(`/projects/admin/edit/${project.id}`, editFields);
            // Optionally refresh project details
            alert("Project metadata updated!");
        } catch (err) {
            alert("Failed to update project metadata.");
        }
    };

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await axios.get(`/projects/${id}`);
                setProject(res.data);
            } catch {
                setProject(null);
            }
        };
        fetchProject();
    }, [id]);

    useEffect(() => {
        if (id) {
            axios.get(`/projects/${id}/likes`).then(res => setLikeData(res.data));
            axios.get(`/projects/${id}/bookmarks`).then(res => setBookmarkData(res.data));
        }
    }, [id]);

    useEffect(() => {
        if (project && project.status === "approved") {
            axios.get(`/comments/${project.id}`)
                .then(res => {
                    setComments(res.data);
                    // Calculate total comments including replies
                    const total = res.data.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0);
                    setCommentCount(total);
                })
                .catch(() => setComments([]));
        }
    }, [project]);

    useEffect(() => {
        if (location.hash === '#comments') {
            document.querySelector('.comments-card-container')?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [location]);

    const handleToggleLike = async () => {
        if (!user) {
            alert("Please login to like projects.");
            return;
        }
        try {
            const res = await axios.post(`/projects/${id}/like`);
            setLikeData({
                liked: res.data.liked,
                count: likeData.count + (res.data.liked ? 1 : -1)
            });
        } catch (err) {
            console.error("Error toggling like:", err);
        }
    };

    const handleToggleBookmark = async () => {
        if (!user) {
            alert("Please login to bookmark projects.");
            return;
        }
        try {
            const res = await axios.post(`/projects/${id}/bookmark`);
            setBookmarkData({ bookmarked: res.data.bookmarked });
        } catch (err) {
            console.error("Error toggling bookmark:", err);
        }
    };

    const handleCommentClick = () => {
        document.querySelector('.comments-card-container')?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleEndorse = async () => {
        setActionLoading(true);
        try {
            await axios.post(`/projects/adviser/endorse/${id}`);
            setProject({ ...project, status: "endorsed" });
            alert("Project endorsed to admin for approval.");
            navigate("/adviser");
        } catch {
            alert("Failed to endorse project.");
        }
        setActionLoading(false);
    };

    const handleNeedRevision = () => {
        setShowRevisionModal(true);
    };

    const submitRevisionReason = async (reason) => {
        setActionLoading(true);
        try {
            let url = "";
            if (user?.role === "research_adviser") { // FIX 1: Add optional chaining
                url = `/projects/adviser/need-revision/${id}`;
            } else if (user?.role === "head_admin" || user?.role === "admin") { // FIX 2: Add optional chaining
                url = `/projects/admin/need-revision/${id}`;
            }
            await axios.post(url, { reason });
            setProject({ ...project, status: "need_revision", rejectionReason: reason });
            alert("Project marked as need revision.");
            setShowRevisionModal(false);
            if (user?.role === "research_adviser") navigate("/adviser"); // FIX 3: Add optional chaining
            else navigate("/head-admin/request-for-revision");
        } catch {
            alert("Failed to mark as need revision.");
        }
        setActionLoading(false);
    };

    const handleHideProject = async () => {
        await axios.patch(`/projects/admin/hide/${project.id}`);
        // Refresh project list
    };

    const handleDeleteProject = async () => {
        await axios.delete(`/projects/admin/delete/${project.id}`);
        // Redirect or refresh
    };

    const handleInformStudent = async () => {
        await axios.post(`/projects/adviser/inform-student/${project.id}`);
        alert("Student has been notified!");
    };

    const handleReupload = async () => {
        const formData = new FormData();
        formData.append("document", reuploadFile);
        await axios.put(`/projects/reupload/${project.id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        alert("Project reuploaded!");
        setShowReuploadModal(false);
    };

    // Handler for file input change
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === "application/pdf") {
            setReuploadFile(file);
        } else {
            setReuploadFile(null);
            alert("Only PDF files are allowed.");
        }
    };

    // Add comment
    const handleAddComment = async () => {
        if (!commentInput.trim()) return;
        try {
            await axios.post(`/comments/${project.id}`, { content: commentInput });
            setCommentInput("");
            // Re-fetch comments
            const res = await axios.get(`/comments/${project.id}`);
            setComments(res.data);
            const total = res.data.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0);
            setCommentCount(total);
        } catch (err) {
            alert("Failed to add comment.");
        }
    };

    // Add reply
    const handleAddReply = async (parentId) => {
        const reply = replyInputs[parentId];
        if (!reply || !reply.trim()) return;
        try {
            await axios.post(`/comments/${project.id}`, { content: reply, parentId });
            setReplyInputs(prev => ({ ...prev, [parentId]: "" }));
            // Re-fetch comments
            const res = await axios.get(`/comments/${project.id}`);
            setComments(res.data);
            const total = res.data.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0);
            setCommentCount(total);
        } catch (err) {
            alert("Failed to add reply.");
        }
    };

    if (!project) return <div className="research-details-container">Project Not Found</div>;

    const fullDocumentPath = project.documentPath;

    return (
        <div className="project-details-page" style={{ padding: 10 }}>
            <div className="research-details-container">
                {/* Project Details Card */}
                <div style={{ position: 'relative' }}>
                    <h2>{project.title}</h2>
                    {showInteractionIcons && (
                        <button
                            style={{ position: 'absolute', top: 0, right: 0, background: 'none', border: 'none', cursor: 'pointer' }}
                            onClick={handleToggleBookmark}
                        >
                            <img
                                src={bookmarkData.bookmarked ? bookmarkedIcon : bookmarkIcon}
                                alt="bookmark"
                                className="interaction-icon"
                            />
                        </button>
                    )}
                </div>
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
                </div>
                <div className="abstract-content" style={{ position: 'relative' }}>
                    <b>Abstract:</b> {project.abstract}
                </div>
                {/* Like and comment icons in a separate row below abstract */}
                {showInteractionIcons && (
                    <div className="interaction-icons-row" style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', margin: '16px 0 8px 0' }}>
                        <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            onClick={handleToggleLike}
                        >
                            <img
                                src={likeData.liked ? likedIcon : likeIcon}
                                alt="like"
                                className="interaction-icon"
                            />
                            <span>{likeData.count}</span>
                        </button>
                        <button
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            onClick={handleCommentClick}
                        >
                            <img
                                src={commentIcon}
                                alt="comment"
                                className="interaction-icon"
                            />
                            <span>{commentCount}</span>
                        </button>
                    </div>
                )}
                {/* The rest of the content stays inside research-details-container */}
                {project.status === "need_revision" && project.rejection_reason && (
                    <div className="revision-required">
                        <b>Revision Required:</b> {project.rejection_reason}
                    </div>
                )}

                {project.status === "admin_revision" && project.rejection_reason && (
                    <div className="revision-required" style={{ background: "#fff8f0", border: "1px solid #fbbf24", color: "#b33834", margin: "1rem 0", padding: "1rem", borderRadius: "8px" }}>
                        <b>Head Admin Revision Reason:</b> {project.rejection_reason}
                    </div>
                )}
                {/* ...existing code for reupload, inform student, pdf actions, adviser actions, head admin actions, revision modal... */}
                {user?.role === "student" &&
                    project.status === "need_revision" &&
                    project.submitted_by === user?.id && (
                        <button
                            className="reupload-btn"
                            onClick={() => setShowReuploadModal(true)}
                        >
                            Reupload Project
                        </button>
                    )}
                {showReuploadModal && (
                    <div
                        className="modal-overlay"
                        style={{
                            position: "fixed",
                            top: 0, left: 0, right: 0, bottom: 0,
                            background: "rgba(37,99,235,0.13)",
                            zIndex: 9999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <div
                            className="modal-content"
                            style={{
                                background: "#fff",
                                borderRadius: "16px",
                                boxShadow: "0 4px 24px rgba(37,99,235,0.13)",
                                padding: "2.5rem 2rem",
                                minWidth: 340,
                                maxWidth: 420,
                                width: "100%",
                                textAlign: "center",
                                position: "relative"
                            }}
                        >
                            <h3 style={{ color: "#2563eb", marginBottom: "1.2rem" }}>Reupload Project</h3>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                style={{
                                    marginBottom: "1.2rem",
                                    padding: "0.7rem",
                                    borderRadius: "8px",
                                    border: "1px solid #d1d5db",
                                    background: "#f8faff",
                                    width: "100%"
                                }}
                            />
                            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1.5rem" }}>
                                <button
                                    onClick={handleReupload}
                                    style={{
                                        background: "#3a3e92",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "0.7rem 1.5rem",
                                        fontWeight: 600,
                                        fontSize: "1rem",
                                        cursor: "pointer",
                                        boxShadow: "0 2px 8px rgba(37,99,235,0.07)"
                                    }}
                                >
                                    Submit
                                </button>
                                <button
                                    onClick={() => setShowReuploadModal(false)}
                                    style={{
                                        background: "#b33834",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "0.7rem 1.5rem",
                                        fontWeight: 600,
                                        fontSize: "1rem",
                                        cursor: "pointer"
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {user?.role === "research_adviser" &&
                    project.status === "admin_revision" && (
                        <button
                            className="inform-student-btn"
                            onClick={handleInformStudent}
                        >
                            Inform Student
                        </button>
                    )}
                <div className="pdf-actions-row">
                    <div className="details-actions">
                        <a href={fullDocumentPath} target="_blank" rel="noopener noreferrer" className="view-pdf-btn">
                            View PDF
                        </a>
                        <a
                            href={`${process.env.REACT_APP_BACKEND_URL}/api/projects/download/${project.id}`}
                            className="download-pdf-btn"
                        >
                            Download PDF
                        </a>
                    </div>
                    <span className="submission-date">
                        Uploaded: {new Date(project.created_at).toLocaleDateString()}
                    </span>
                </div>
                </div>
            {/* Comments Section: Separate Card */}
            {project.status === "approved" && (
                <div className="comments-card-container" style={{
                    width: "100%",
                    maxWidth: "1800px",
                    margin: "30px auto 40px auto",
                    padding: "2.5rem 2rem 3.5rem 2rem",
                    background: "#f8faff",
                    borderRadius: "16px",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                    boxSizing: "border-box"
                }}>
                    <h3 className="comments-title" style={{ color: "#2563eb", marginBottom: "1rem" }}>Comments</h3>
                    {comments.length === 0 ? (
                        <div className="no-comments">No comments yet.</div>
                    ) : (
                        <ul className="comments-list">
                            {comments.map(comment => (
                                <li key={comment.id} className="comment-item">
                                    <div className="comment-author">{comment.user?.full_name || "Unknown"}</div>
                                    <div className="comment-content">{comment.content}</div>
                                    <div className="comment-date">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </div>
                                    {/* Replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <ul className="replies-list">
                                            {comment.replies.map(reply => (
                                                <li key={reply.id} className="reply-item">
                                                    <div className="reply-author">{reply.user?.full_name || "Unknown"}</div>
                                                    <div className="reply-content">{reply.content}</div>
                                                    <div className="reply-date">
                                                        {new Date(reply.createdAt).toLocaleString()}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    {/* --- Allow ALL users to reply --- */}
                                    {user && (
                                        <div className="reply-input-row">
                                            <input
                                                type="text"
                                                placeholder="Reply to this comment..."
                                                value={replyInputs[comment.id] || ""}
                                                onChange={e => setReplyInputs(prev => ({ ...prev, [comment.id]: e.target.value }))}
                                                className="reply-input"
                                            />
                                            <button
                                                className="reply-btn"
                                                onClick={() => handleAddReply(comment.id)}
                                            >
                                                Reply
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    {/* Add new comment */}
                    <div className="add-comment-row">
                        <input
                            type="text"
                            placeholder="Add a comment or feedback..."
                            value={commentInput}
                            onChange={e => setCommentInput(e.target.value)}
                            className="comment-input"
                        />
                        <button
                            className="send-feedback-btn"
                            onClick={handleAddComment}
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;