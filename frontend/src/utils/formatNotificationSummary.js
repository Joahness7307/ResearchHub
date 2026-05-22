/**
 * formatNotificationSummary
 * 
 * Extracts a short, scannable summary from a full notification reason string.
 * Used in notification lists and dropdowns only.
 * The full reason is always preserved in NotificationDetails page.
 * 
 * Strategy:
 * 1. Strip everything after "Reason:" or "reason:" — that is the detailed part
 * 2. Strip everything after "Please reupload" — too verbose for list view
 * 3. Trim and cap at 90 characters as a final safety net
 */
export function formatNotificationSummary(reason = "") {
  if (!reason) return "New notification";

  let summary = reason;

  // Remove detailed reason text that follows "Reason:"
  const reasonIndex = summary.indexOf(" Reason:");
  if (reasonIndex !== -1) {
    summary = summary.slice(0, reasonIndex);
  }

   // Remove " Reason from Head Admin:" and everything after
  const headAdminIndex = summary.indexOf(" Reason from Head Admin:");
  if (headAdminIndex !== -1) {
    summary = summary.slice(0, headAdminIndex);
  }

  // Remove verbose reupload instructions
  const reuploadIndex = summary.indexOf(". Please reupload");
  if (reuploadIndex !== -1) {
    summary = summary.slice(0, reuploadIndex);
  }

  // Remove trailing punctuation left after slicing
  summary = summary.replace(/[.,\s]+$/, "");

  // Final safety cap — no list item should exceed 90 chars
  if (summary.length > 90) {
    summary = summary.slice(0, 90).replace(/\s+\S*$/, "") + "…";
  }

  return summary.trim();
}