import React from "react";
import pendingIcon from "../../assets/icons/pending-icon.png";
import endorsedIcon from "../../assets/icons/endorsed-icon.png";
import revisionIcon from "../../assets/icons/request-revision-icon.png";
import informedIcon from "../../assets/icons/informed-student-icon.png";
import reuploadedIcon from "../../assets/icons/reuploaded-icon.png";
import approvedIcon from "../../assets/icons/approved-icon.png";
import { formatNotificationSummary } from "../../utils/formatNotificationSummary";
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

export function filterTimelineEvents(events = [], currentUserRole) {
  return events.filter((event) => {
    const message = (event.message || "").toLowerCase();

    // STUDENT VIEW
    if (currentUserRole === "student") {

      if (message.includes("new pending project in your")) {
        return false;
      }

      if (
        message.includes("you endorsed") &&
        message.includes("awaiting admin approval")
      ) {
        return false;
      }

      if (
        message.includes("project") &&
        message.includes("was marked for revision")
      ) {
        return false;
      }

      if (
        message.includes("project") &&
        message.includes("requires revision from head admin")
      ) {
        return false;
      }

      if (
        message.includes("you requested revision")
      ) {
        return false;
      }

      if (
        message.includes("student reuploaded revised project")
      ) {
        return false;
      }

      if (
        message.includes("informed the student about revision ")
      ) {
        return false;
      }

      if (
        message.includes("was endorsed by research adviser")
      ) {
        return false;
      }

      if (
        message.includes("your project") &&
        message.includes("approved")
      ) {
        return false;
      }

      if (
        message.includes("project") &&
        message.includes("has been approved")
      ) {
        return false;
      }

      return true;
    }

    // RESEARCH ADVISER VIEW
    if (currentUserRole === "research_adviser") {

      if (message.includes("you submitted the project")) {
        return false;
      }

      if (
        message.includes("your project") &&
        message.includes("endorsed for admin")
      ) {
        return false;
      }

      if (
        message.includes("your") &&
        message.includes("project requires revision")
      ) {
        return false;
      }

      if (
        message.includes("requested revision")
      ) {
        return false;
      }

      if (
        message.includes("your revised project") &&
        message.includes("reuploaded")
      ) {
        return false;
      }

      if (
        message.includes("was endorsed by research adviser")
      ) {
        return false;
      }

      if (
        message.includes("your project") &&
        message.includes("approved")
      ) {
        return false;
      }

      if (
        message.includes("you approved") &&
        message.includes("project")
      ) {
        return false;
      }

      return true;
    }

    // HEAD ADMIN VIEW
    if (currentUserRole === "head_admin") {

      if (message.includes("new pending project in your department")) {
        return false;
      }

      if (
        message.includes("you endorsed the") &&
        message.includes("awaiting admin approval")
      ) {
        return false;
      }

      if (message.includes("you submitted the project")) {
        return false;
      }

      if (
        message.includes("your project") &&
        message.includes("endorsed for admin")
      ) {
        return false;
      }

      if (
        message.includes("your") &&
        message.includes("project requires revision")
      ) {
        return false;
      }

      if (
        message.includes("project") &&
        message.includes("was marked for revision")
      ) {
        return false;
      }

      if (
        message.includes("project") &&
        message.includes("requires revision")
      ) {
        return false;
      }

      if (
        message.includes("your revised project") &&
        message.includes("reuploaded")
      ) {
        return false;
      }

      if (
        message.includes("student reuploaded revised project")
      ) {
        return false;
      }

      if (
        message.includes("your project") &&
        message.includes("approved")
      ) {
        return false;
      }

      if (
        message.includes("project") &&
        message.includes("has been approved")
      ) {
        return false;
      }

      return true;
    }

    return true;
  });
}

const ProjectTimeline = ({ events = [], activeNotificationId, currentUserRole }) => {
  
  const filteredEvents = filterTimelineEvents(events, currentUserRole);

  if (!filteredEvents.length) {
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
        {filteredEvents.map((event) => {
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
                <p className="project-timeline-message">{formatNotificationSummary(event.message)}</p>
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
