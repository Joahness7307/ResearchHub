import React, { useState, useEffect, useContext } from "react";
import axios from "../../api/axios";
import { API_ROUTES } from "../../api/apiRoutes";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { dispatchWorkflowRefresh } from "../../utils/workflowEvents";
import RevisionReasonModal from "../RevisionReasonModal";
import "./ProjectDetails.css";
import categoryColors from "../../constants/categoryColors";
import bookmarkIcon from "../../assets/icons/bookmark-icon.png";
import bookmarkedIcon from "../../assets/icons/bookmarked-icon.png";
import commentIcon from "../../assets/icons/comment-icon.png";

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const { user } = useContext(AuthContext); // user can be null
    const [actionLoading, setActionLoading] = useState(false);
    const [showRevisionModal, setShowRevisionModal] = useState(false);

    const [showReuploadModal, setShowReuploadModal] = useState(false);
    const [reuploadFile, setReuploadFile] = useState(null);

    const [comments, setComments] = useState([]);
    const [commentInput, setCommentInput] = useState("");
    const [replyInputs, setReplyInputs] = useState({});
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const res = await axios.get(API_ROUTES.projects.getProject(id));
                setProject(res.data);
            } catch {
                setProject(null);
            }
        };
        fetchProject();
    }, [id]);

    // fetch bookmark status
    useEffect(() => {
        const fetchBookmarkStatus = async () => {
            if (!user || !id) {
                setIsBookmarked(false);
                return;
            }
            try {
                const res = await axios.get(API_ROUTES.bookmarks.getBookmarkState(id));
                setIsBookmarked(!!res.data.bookmarked);
            } catch (err) {
                setIsBookmarked(false);
            }
        };
        fetchBookmarkStatus();
    }, [user, id]);

    // Toggle handler (already good, just make sure it dispatches event)
    const handleToggleBookmark = async () => {
        if (!user) {
            alert("Please log in to bookmark projects.");
            return;
        }
        setBookmarkLoading(true);
        try {
            if (isBookmarked) {
                await axios.delete(API_ROUTES.bookmarks.toggleBookmark(id));
                setIsBookmarked(false);
            } else {
                await axios.post(API_ROUTES.bookmarks.toggleBookmark(id));
                setIsBookmarked(true);
            }
            // This helps MyAccount page refresh bookmarks
            window.dispatchEvent(new Event("bookmarks-updated"));
        } catch (err) {
            alert("Failed to update bookmark.");
        } finally {
            setBookmarkLoading(false);
        }
    };

    const handleEndorse = async () => {
        setActionLoading(true);
        try {
            const res = await axios.post(API_ROUTES.projects.adviserEndorse(id));
            const updated = res.data?.project || { ...project, status: "endorsed" };
            setProject(updated);
            dispatchWorkflowRefresh({ projectId: id, status: "endorsed" });
            alert("Project endorsed to admin for approval.");
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
                url = API_ROUTES.projects.needRevision.adviser(id);
            } else if (user?.role === "research_coordinator") { // FIX 2: Add optional chaining
                url = API_ROUTES.projects.needRevision.admin(id);
            }
            const res = await axios.post(url, { reason });
            const newStatus =
                user?.role === "research_coordinator" ? "admin_revision" : "need_revision";
            const updated =
                res.data?.project || {
                    ...project,
                    status: newStatus,
                    rejection_reason: reason,
                };
            setProject(updated);
            dispatchWorkflowRefresh({ projectId: id, status: newStatus });
            alert("Project marked as need revision.");
            setShowRevisionModal(false);
        } catch {
            alert("Failed to mark as need revision.");
        }
        setActionLoading(false);
    };

    const handleInformStudent = async () => {
        setActionLoading(true);
        try {
            const res = await axios.post(API_ROUTES.projects.informStudent(project.id));
            const updated =
                res.data?.project || { ...project, status: "need_revision" };
            setProject(updated);
            dispatchWorkflowRefresh({ projectId: project.id, status: "need_revision" });
            alert("Student has been notified!");
        } catch (err) {
            const msg =
                err.response?.data?.message || "Failed to notify student.";
            alert(msg);
        }
        setActionLoading(false);
    };

    const handleReupload = async () => {
        if (!reuploadFile) {
            alert("Please select a PDF file to upload.");
            return;
        }
        setActionLoading(true);
        try {
            const formData = new FormData();
            formData.append("document", reuploadFile);
            const res = await axios.put(
                API_ROUTES.projects.reupload(project.id),
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            const updated =
                res.data?.project || {
                    ...project,
                    status: "pending",
                    rejection_reason: null,
                };
            setProject(updated);
            dispatchWorkflowRefresh({ projectId: project.id, status: "pending" });
            alert("Project reuploaded and is now pending adviser review.");
            setShowReuploadModal(false);
            setReuploadFile(null);
        } catch (err) {
            const msg =
                err.response?.data?.message || "Failed to reupload project.";
            alert(msg);
        }
        setActionLoading(false);
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

    // Fetch comments
    useEffect(() => {
    if (project?.status === "approved") {
        axios.get(API_ROUTES.comments.getByProject(project.id))
        .then(res => setComments(res.data || []))
        .catch(err => {
            console.error("Failed to load comments:", err);
            setComments([]);
        });
    } else {
        // Clear comments if project is not approved
        setComments([]);
    }
    }, [project?.id, project?.status]); // Re-run if status changes

    // Add comment
    const handleAddComment = async () => {
        if (!commentInput.trim()) return;
        try {
            await axios.post(API_ROUTES.comments.getByProject(project.id), { content: commentInput });
            setCommentInput("");
            const res = await axios.get(API_ROUTES.comments.getByProject(project.id));
            setComments(res.data);
        } catch (err) {
            alert("Failed to add comment.");
        }
    };

    // Add reply
    const handleAddReply = async (parentId) => {
        const reply = replyInputs[parentId];
        if (!reply || !reply.trim()) return;
        try {
            await axios.post(API_ROUTES.comments.getByProject(project.id), { content: reply, parentId });
            setReplyInputs(prev => ({ ...prev, [parentId]: "" }));
            // Re-fetch comments
            const res = await axios.get(API_ROUTES.comments.getByProject(project.id));
            setComments(res.data);
        } catch (err) {
            alert("Failed to add reply.");
        }
    };

    if (!project) return <div className="research-details-container">Project Not Found</div>;

    const fullDocumentPath = project.documentPath;

    return (
        <div className="project-details-page" style={{ padding: 10 }}>
            <div className="research-details-container">
                <div className="project-header-with-bookmark">
                <h2 className="project-title">{project.title}</h2>

                {/* Beautiful Floating Bookmark Icon - Inside Card */}
                {user && (
                    <button
                    onClick={handleToggleBookmark}
                    disabled={bookmarkLoading}
                    className="project-bookmark-btn"
                    title={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
                    >
                    <img
                        src={isBookmarked ? bookmarkedIcon : bookmarkIcon}
                        alt={isBookmarked ? "Bookmarked" : "Bookmark"}
                        className={`project-bookmark-icon ${isBookmarked ? "bookmarked" : ""} ${bookmarkLoading ? "loading" : ""}`}
                    />
                    </button>
                )}
                </div>
                {project.title_description && (
                    <div className="project-title-description">
                    {project.title_description}
                    </div>
                )}
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
                <p className="abstract-content"><b>Abstract:</b> {project.abstract}</p>
                {project.status === "need_revision" && project.rejection_reason && (
                    <div className="revision-required">
                        <b>Revision Required:</b> {project.rejection_reason}
                    </div>
                )}

                {project.status === "admin_revision" &&
                    project.rejection_reason &&
                    user?.role !== "student" &&
                    user?.role !== "guest" && (
                    <div className="revision-required" style={{ background: "#fff8f0", border: "1px solid #fbbf24", color: "#b33834", margin: "1rem 0", padding: "1rem", borderRadius: "8px" }}>
                        <b>Research Coordinator Revision Reason:</b> {project.rejection_reason}
                    </div>
                )}
                
                {/* FIX 4: Add optional chaining to user.role and user.id */}
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
                {/* FIX 5: Add optional chaining to user.role */}
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
                {/* FIX 6: Add optional chaining to user.role */}
                {user?.role === "research_adviser" && project.status === "pending" && (
                    <div className="adviser-actions">
                        <button
                            onClick={handleEndorse}
                            disabled={actionLoading}
                            className="endorse-btn"
                        >
                            {actionLoading ? "Processing..." : "Approve (Endorse to Admin)"}
                        </button>
                        <button
                            onClick={handleNeedRevision}
                            disabled={actionLoading}
                            className="revision-btn"
                        >
                            {actionLoading ? "Processing..." : "Request Revision"}
                        </button>
                    </div>
                )}

                    {/* FIX 7: Add optional chaining to user.role */}
                    {user?.role === "research_coordinator" && project.status === "endorsed" && (
                        <div className="adviser-actions">
                            <button
                                onClick={async () => {
                                    setActionLoading(true);
                                    try {
                                        const res = await axios.post(
                                            API_ROUTES.projects.approve(project.id)
                                        );
                                        const updated =
                                            res.data?.project || {
                                                ...project,
                                                status: "approved",
                                            };
                                        setProject(updated);
                                        dispatchWorkflowRefresh({
                                            projectId: project.id,
                                            status: "approved",
                                        });
                                        alert("Project approved and moved to repository.");
                                    } catch {
                                        alert("Failed to approve project.");
                                    }
                                    setActionLoading(false);
                                }}
                                disabled={actionLoading}
                                className="endorse-btn"
                            >
                                {actionLoading ? "Processing..." : "Approve"}
                            </button>
                            <button
                                onClick={() => setShowRevisionModal(true)}
                                disabled={actionLoading}
                                className="revision-btn"
                            >
                                {actionLoading ? "Processing..." : "Request Revision"}
                            </button>
                        </div>
                    )}
                </div>

                {/* COMMENTS SECTION - ONLY FOR APPROVED PROJECTS */}
                {project.status === "approved" ? (
                <div className="comments-section">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                        <h3 className="comments-title" style={{ marginBottom: 10 }}>Comments</h3>
                        <img 
                            src={commentIcon} 
                            alt="Comments" 
                            className="comments-header-icon" 
                        />
                        <span style={{ fontWeight: 600, color: "#2563eb", fontSize: "1.1rem", marginBottom: 10 }}>
                            {comments.reduce((acc, c) => acc + 1 + (c.replies ? c.replies.length : 0), 0)}
                        </span>
                        </div>

                    {/* Show loading or no comments */}
                    {comments.length === 0 ? (
                    <div className="no-comments">No comments yet. Be the first to leave feedback!</div>
                    ) : (
                    <ul className="comments-list">
                        {comments.map(comment => (
                        <li key={comment.id} className="comment-item">
                            <div className="comment-author">
                            {comment.user?.full_name || "Anonymous User"}
                            </div>
                            <div className="comment-content">{comment.content}</div>
                            <div className="comment-date">
                            {new Date(comment.created_at).toLocaleString()}
                            </div>

                            {/* Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                            <ul className="replies-list">
                                {comment.replies.map(reply => (
                                <li key={reply.id} className="reply-item">
                                    <div className="reply-author">
                                    {reply.user?.full_name || "Anonymous"}
                                    </div>
                                    <div className="reply-content">{reply.content}</div>
                                    <div className="reply-date">
                                    {new Date(reply.created_at).toLocaleString()}
                                    </div>
                                </li>
                                ))}
                            </ul>
                            )}

                            {/* Reply Input - Only if logged in student and guest users */}
                            {user && (user.role === "student" || user.role === "guest") && (
                            <div className="reply-input-row">
                                <input
                                type="text"
                                placeholder="Write a reply..."
                                value={replyInputs[comment.id] || ""}
                                onChange={(e) =>
                                    setReplyInputs(prev => ({ ...prev, [comment.id]: e.target.value }))
                                }
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

                    {/* Add New Comment - Only if user is logged in student and guest users */}
                    {user && (user.role === "student" || user.role === "guest") ? (
                    <div className="add-comment-row">
                        <input
                        type="text"
                        placeholder="Add a comment or feedback..."
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        className="comment-input"
                        />
                        <button
                        className="send-feedback-btn"
                        onClick={handleAddComment}
                        disabled={!commentInput.trim()}
                        >
                        Send
                        </button>
                    </div>
                    ) : user ? (
                    // Logged in but not student → show message
                    <p style={{ color: "#666", fontStyle: "italic", marginTop: "1.5rem", textAlign: "center" }}>
                        Only students and guests can leave comments on approved projects.
                    </p>
                    ) : (
                    // Not logged in
                    <p style={{ color: "#666", fontStyle: "italic", marginTop: "1rem" }}>
                        Please log in as a student or guest to leave a comment.
                    </p>
                    )}
                </div>
                ) : (
                // Optional: Show a message for non-approved projects
                project.status !== "approved" && ["pending", "endorsed", "need_revision", "admin_revision"].includes(project.status) && (
                    <div className="comments-section" style={{ opacity: 0.6, pointerEvents: "none" }}>
                    <p style={{ color: "#888", fontStyle: "italic", textAlign: "center", padding: "2rem 0" }}>
                        Comments are only available for approved projects.
                    </p>
                    </div>
                )
                )}

                <RevisionReasonModal
                    show={showRevisionModal}
                    onClose={() => setShowRevisionModal(false)}
                    onSubmit={submitRevisionReason}
                />
            </div>
    );
};

export default ProjectDetails;