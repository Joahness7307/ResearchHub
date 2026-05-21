import React from "react";
import pendingIcon from "../../assets/icons/pending.png";
import endorsedIcon from "../../assets/icons/endorsed.png";
import revisionIcon from "../../assets/icons/request-revision.png";
import informedIcon from "../../assets/icons/adviser-informed-student-icon.png";
import reuploadedIcon from "../../assets/icons/reuploaded-icon.png";
import approvedIcon from "../../assets/icons/approved.png";
import "./ProjectTimeline.css";

const EVENT_META = {
  pending: { label: "Pending", icon: pendingIcon, className: "pending" },
  endorsed: { label: "Endorsed", icon: endorsedIcon, className: "endorsed" },
  revision_request: { label: "Revision Request", icon: revisionIcon, className: "revision" },
  informed_student: { label: "Informed Student", icon: informedIcon, className: "informed" },
  reuploaded: { label: "Reuploaded", icon: reuploadedIcon, className: "reuploaded" },
  approved: { label: "Approved", icon: approvedIcon, className: "approved" },
  activity: { label: "Activity", icon: pendingIcon, className: "activity" },
};

function formatRole(role) {
  if (!role) return "System";
  return role.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

const ProjectTimeline = ({ events = [], activeNotificationId }) => {
  if (!events.length) {
    return (
      <section className="project-timeline">
        <div className="project-timeline-empty">No workflow history available yet.</div>
      </section>
    );
  }

  return (
    <section className="project-timeline" aria-label="Project workflow timeline">
      <h3 className="project-timeline-title">Project Workflow Timeline</h3>
      <ol className="project-timeline-list">
        {events.map((event) => {
          const meta = EVENT_META[event.eventType] || EVENT_META.activity;
          const isActive = Number(event.id) === Number(activeNotificationId);

          return (
            <li
              key={`${event.id}-${event.timestamp}`}
              className={`project-timeline-item ${meta.className}${isActive ? " active" : ""}`}
            >
              <div className="project-timeline-marker">
                <img src={meta.icon} alt="" aria-hidden="true" />
              </div>
              <div className="project-timeline-content">
                <div className="project-timeline-heading">
                  <span className={`project-timeline-badge ${meta.className}`}>
                    {meta.label}
                  </span>
                  {isActive && <span className="project-timeline-current">Opened notification</span>}
                </div>
                <p className="project-timeline-message">{event.message}</p>
                <div className="project-timeline-meta">
                  <span>Actor: {formatRole(event.actorRole)}</span>
                  <span>{formatDate(event.timestamp)}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};

export default ProjectTimeline;
