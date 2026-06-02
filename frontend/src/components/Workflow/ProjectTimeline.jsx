import React from "react";
import { getNotificationMetadata } from "../../utils/notificationMetadata";
import "./ProjectTimeline.css";

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
          const meta = getNotificationMetadata(event);
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
                <p className="project-timeline-message">{meta.summary}</p>
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
