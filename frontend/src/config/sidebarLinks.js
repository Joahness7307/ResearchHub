export const sidebarLinks = {
  admin: [
    { label: "Dashboard", to: "/admin" },
    { label: "Manage Users", to: "/admin/manage-users" },
    { label: "Manage Projects", to: "/admin/manage-projects" },
    { label: "Academic Settings", to: "/admin/academic" },
  ],
  head_admin: [
    { label: "Dashboard", to: "/head-admin" },
    { label: "Pending Projects", to: "/head-admin/pending-projects" },
    { label: "Approved Projects", to: "/head-admin/approved-projects" },
    { label: "Request for Revision", to: "/head-admin/request-for-revision" },
    { label: "Project Repository", to: "/head-admin/repository" },
    { label: "Notifications", to: "/head-admin/notifications" },
  ],
  research_adviser: [
    { label: "Dashboard", to: "/adviser" },
    { label: "Pending Projects", to: "/adviser/pending-projects" },
    { label: "Endorsed Projects", to: "/adviser/endorsed-projects" },
    { label: "Approved Projects", to: "/adviser/approved-projects" },
    { label: "Request for Revision", to: "/adviser/request-for-revision" },
    { label: "Project Repository", to: "/adviser/repository" },
    { label: "Notifications", to: "/adviser/notifications" },
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
