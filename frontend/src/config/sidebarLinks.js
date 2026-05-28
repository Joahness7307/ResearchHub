export const sidebarLinks = {
  admin: [
    { label: "Dashboard", to: "/admin" },
    { label: "Manage Users", to: "/admin/manage-users" },
    { label: "Manage Projects", to: "/admin/manage-projects" },
    { label: "Academic Settings", to: "/admin/academic" },
  ],
  research_coordinator: [
    { label: "Dashboard", to: "/research-coordinator" },
    { label: "Pending Projects", to: "/research-coordinator/pending-projects" },
    { label: "Approved Projects", to: "/research-coordinator/approved-projects" },
    { label: "Request for Revision", to: "/research-coordinator/request-for-revision" },
    { label: "Project Repository", to: "/research-coordinator/repository" },
    { label: "Notifications", to: "/research-coordinator/notifications" },
  ],
  research_adviser: [
    { label: "Dashboard", to: "/research-adviser" },
    { label: "Pending Projects", to: "/research-adviser/pending-projects" },
    { label: "Endorsed Projects", to: "/research-adviser/endorsed-projects" },
    { label: "Approved Projects", to: "/research-adviser/approved-projects" },
    { label: "Request for Revision", to: "/research-adviser/request-for-revision" },
    { label: "Project Repository", to: "/research-adviser/repository" },
    { label: "Notifications", to: "/research-adviser/notifications" },
  ],
  student: [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Notifications", to: "/notifications" },
  ],
  guest: [
    { label: "Dashboard", to: "/dashboard" },
  ],
};

export const commonSidebarLinks = [
  { label: "My Account", to: "/my-account" },
];

export const getSidebarLinks = (role) => sidebarLinks[role] || [];
export const getMobileSidebarLinks = (role) => [...getSidebarLinks(role), ...commonSidebarLinks];
