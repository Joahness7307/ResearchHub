import React from "react";
import { formatNotificationSummary } from "../../utils/formatNotificationSummary";
import "./ProjectTimeline.css";

const EVENT_META = {
  submitted: {
    label: "Pending",
    icon: "/workflow-timeline-icons/pending-icon.png",
    className: "pending"
  },

  endorsed: {
    label: "Endorsed",
    icon: "/workflow-timeline-icons/endorsed-icon.png",
    className: "endorsed"
  },

  revision_request: {
    label: "Revision Request",
    icon: "/workflow-timeline-icons/request-revision-icon.png",
    className: "revision"
  },

  informed_student: {
    label: "Informed Student",
    icon: "/workflow-timeline-icons/informed-student-icon.png",
    className: "informed"
  },

  reuploaded: {
    label: "Reuploaded",
    icon: "/workflow-timeline-icons/reuploaded-icon.png",
    className: "reuploaded"
  },

  approved: {
    label: "Approved",
    icon: "/workflow-timeline-icons/approved-icon.png",
    className: "approved"
  },

  activity: {
    label: "Activity",
    icon: "/workflow-timeline-icons/pending-icon.png",
    className: "activity"
  },
};

function formatRole(role) {
  if (!role) return "System";
  return role.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

export function filterTimelineEvents(events = [], currentUserRole, currentUserId) {
  return events.filter((event) => {

    const recipient = event.recipientRole;
    const eventType = event.eventType;
    const message = (event.message || "").toLowerCase();

    // ─────────────────────────────────────────────
    // STUDENT VIEW
    // Show only events where student is the recipient
    // PLUS key workflow events that affect them
    // ─────────────────────────────────────────────
    if (currentUserRole === "student") {
      // Always show events sent TO the student
      if (recipient === "student") return true;

      // Also show adviser-informed events (student needs to see this context)
      if (eventType === "informed_student" && recipient === "research_adviser") {
        // Show only the student-facing inform message, not the adviser self-confirm
        return message.includes("requires revision") && 
               message.includes("please reupload");
      }

      // Hide everything else (adviser notifications, research coordinator notifications)
      return false;
    }

    // ─────────────────────────────────────────────
    // RESEARCH ADVISER VIEW
    // Show only events where adviser is the recipient
    // ─────────────────────────────────────────────
    if (currentUserRole === "research_adviser") {
      // Show ONLY notifications intended for THIS adviser
      if (
        recipient === "research_adviser" &&
        Number(event.researchAdviserId) === Number(currentUserId)
      ) {
        return true;
      }

      // Hide everything else
      return false;
    }

    // ─────────────────────────────────────────────
    // RESEARCH COORDINATOR VIEW
    // Show only events where research_coordinator is the recipient
    // ─────────────────────────────────────────────
    if (currentUserRole === "research_coordinator") {
      // Always show events sent TO the research coordinator
      if (recipient === "research_coordinator") return true;

      // Hide everything else
      return false;
    }

    // Default — show everything (for admin or unknown roles)
    return true;
  });
}

const ProjectTimeline = ({ events = [], activeNotificationId, currentUserRole, currentUserId }) => {
  
  const filteredEvents = filterTimelineEvents(events, currentUserRole, currentUserId);

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
