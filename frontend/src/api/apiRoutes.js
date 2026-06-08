export const API_ROUTES = {
  // Auth routes
  auth: {
    login: "users/login",
    register: "users/register",
    forceChangePassword: "/users/force-change-password",
  },

  // User routes
  user: {
    profile: "/users/profile",
    updateProfile: "/users/profile/update",
    myProjects: "/users/my-projects",
  },

  // Academic routes
  academic: {
    getDepartments: "/academic/departments",
    getStrands: "/academic/strands",
    getBlocksByDepartment: (deptId) =>
      `/academic/departments/${deptId}/blocks`,
    getMajorsByDepartment: (deptId) =>
      `/academic/departments/${deptId}/majors`,

    createDepartment: `/academic/admin/departments`,
    updateDepartment: (id) => `/academic/admin/departments/${id}`,
    deleteDepartment: (id) => `/academic/admin/departments/${id}`,
    createBlockByDepartment: (deptId) => `/academic/admin/departments/${deptId}/blocks`,
    updateBlockByDepartment: (id) => `/academic/admin/blocks/${id}`,
    deleteBlockByDepartment: (id) => `/academic/admin/blocks/${id}`,
    createMajorByDepartment: (deptId) => `/academic/admin/departments/${deptId}/majors`,
    updateMajorByDepartment: (id) => `/academic/admin/majors/${id}`,
    deleteMajorByDepartment: (id) => `/academic/admin/majors/${id}`,
    createStrand: `/academic/admin/strands`,
    updateStrand: (id) => `/academic/admin/strands/${id}`,
    deleteStrand: (id) => `/academic/admin/strands/${id}`,
  },

  // Admin routes
  admin: {
    // Users
    getAllUsers: "users/all",
    getUserCount: "users/count",
    addUser: "users/add",
    updateUser: (id) => `users/update/${id}`,
    deleteUser: (id) => `users/delete/${id}`,
    // Projects
    getProjectCount: "/projects/admin/counts",
    getAllProjects: "projects/admin/all",
    deleteProject: (id) => `projects/admin/delete/${id}`
  },

  // Project routes
  projects: {
    getAllProjects: "/projects",
    projectCount: "/projects/public/counts",
    submit: "/projects/submit",
    getProject: (id) => `/projects/${id}`,
    adviserEndorse: (id) => `/projects/research-adviser/endorse/${id}`,
    needRevision: {
      researchAdviser: (id) => `/projects/research-adviser/need-revision/${id}`,
      researchCoordinator: (id) => `/projects/admin/need-revision/${id}`,
    },
    informStudent: (id) => `/projects/research-adviser/inform-student/${id}`,
    reuploadProject: (id) => `/projects/reupload/${id}`,
    approve: (id) => `/projects/admin/approve/${id}`
  },

  // Comment routes
  comments: {
    getByProject: (projectId) => `/comments/${projectId}`
  },

  // Bookmark routes
  bookmarks: {
    getBookmarkState: (projectId) => `/bookmarks/is-bookmarked/${projectId}`,
    toggleBookmark: (projectId) => `/bookmarks/${projectId}`,
    getMyBookmarks: "/bookmarks/my",
  },

  // Notification routes
  notifications: {
    student: "/notifications/student",
    researchCoordinatorById: (id) => `/notifications/research-coordinator/${id}`,
    researchAdviserById: (id) => `/notifications/research-adviser/${id}`,
    projectTimeline: (projectId) => `/notifications/project/${projectId}/timeline`,
    studentMarkAsRead: (id) => `/notifications/student/${id}/read`,
    studentMarkAllAsRead: "/notifications/student/mark-all-read",
    researchAdviserMarkAsRead: (id) => `/notifications/research-adviser/${id}/read`,
    researchCoordinatorMarkAsRead: (id) => `/notifications/research-coordinator/${id}/read`,
  },

  // Research Coordinator routes
  research_coordinator: {
    getAllProjects: "projects/research-coordinator/all",
  },

  // Research Adviser routes
  research_adviser: {
    getAllProjects: "projects/research-adviser/all",
  },

};
