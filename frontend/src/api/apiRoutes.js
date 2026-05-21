export const API_ROUTES = {
  auth: {
    login: "users/login",
    register: "users/register",
    forceChangePassword: "/users/force-change-password",
    profile: "/users/profile",
  },

  student: {
    getAllProjects: "/projects",
    projectCount: "/projects/public/counts",
  },

  projects: {
    submit: "/projects/submit",
    getProject: (id) => `/projects/${id}`,
    adviserEndorse: (id) => `/projects/adviser/endorse/${id}`,
    needRevision: {
      adviser: (id) => `/projects/adviser/need-revision/${id}`,
      admin: (id) => `/projects/admin/need-revision/${id}`,
    },
    informStudent: (id) => `/projects/adviser/inform-student/${id}`,
    reupload: (id) => `/projects/reupload/${id}`,
    approve: (id) => `/projects/admin/approve/${id}`
  },

  comments: {
    getByProject: (projectId) => `/comments/${projectId}`
  },

  bookmarks: {
    getBookmarkState: (projectId) => `/bookmarks/is-bookmarked/${projectId}`,
    toggleBookmark: (projectId) => `/bookmarks/${projectId}`,
    getMyBookmarks: "/bookmarks/my"
  },

  notifications: {
    student: "/notifications/student",
    adminById: (id) => `/notifications/admin/${id}`,
    headAdminById: (id) => `/notifications/head-admin/${id}`,
    adviserById: (id) => `/notifications/adviser/${id}`,
    projectTimeline: (projectId) => `/notifications/project/${projectId}/timeline`,
    studentMarkAsRead: (id) => `/notifications/student/${id}/read`,
    adviserMarkAsRead: (id) => `/notifications/adviser/${id}/read`,
    headAdminMarkAsRead: (id) => `/notifications/head-admin/${id}/read`,
    adminMarkAsRead: (id) => `/notifications/admin/${id}/read`,
  },

  admin: {
    userCount: "users/count",
    projectCount: "/projects/admin/counts",
    allUsers: "users/all",
    addUser: "users/add",
    getAllProjects: "projects/admin/all",
    updateUser: (id) => `users/update/${id}`,
    deleteUser: (id) => `users/delete/${id}`,
    deleteProject: (id) => `projects/admin/delete/${id}`,
  },

  head_admin: {
    getAllProjects: "projects/head-admin/all",
  },

  research_adviser: {
    getAllProjects: "projects/adviser/all",
  },

  academic: {
    departments: "/academic/departments",
    strands: "/academic/strands",
    blocks: (deptId) =>
      `/academic/departments/${deptId}/blocks`,
    majors: (deptId) =>
      `/academic/departments/${deptId}/majors`,
    createBlock: (deptId) => `/academic/admin/departments/${deptId}/blocks`,
    updateBlock: (id) => `/academic/admin/blocks/${id}`,
    deleteBlock: (id) => `/academic/admin/blocks/${id}`,
    createMajor: (deptId) => `/academic/admin/departments/${deptId}/majors`,
    updateMajor: (id) => `/academic/admin/majors/${id}`,
    deleteMajor: (id) => `/academic/admin/majors/${id}`,
    createStrand: `/academic/admin/strands`,
    updateStrand: (id) => `/academic/admin/strands/${id}`,
    deleteStrand: (id) => `/academic/admin/strands/${id}`,
    createDepartment: `/academic/admin/departments`,
    updateDepartment: (id) => `/academic/admin/departments/${id}`,
    deleteDepartment: (id) => `/academic/admin/departments/${id}`,
  }
};
