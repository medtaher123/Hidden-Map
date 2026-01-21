const API_BASE = `http://localhost:3000`;

export const API_ROUTES = {
  base: API_BASE,
  auth: {
    login: `${API_BASE}/auth/login`,
    register: `${API_BASE}/auth/register`,
    logout: `${API_BASE}/auth/logout`,
    profile: `${API_BASE}/auth/me`,
  },

  users: {
    base: `${API_BASE}/users`,
    byEmail: (email: string) =>
      `${API_BASE}/users/${encodeURIComponent(email)}`,
  },

  locations: {
    base: `${API_BASE}/locations`,
  },
  files: {
    base: `${API_BASE}/files`,
    upload: `${API_BASE}/files/upload`,
  },

  favorites: {
    base: `${API_BASE}/favorites`,
    byLocation: (locationId: string) => `${API_BASE}/locations/${locationId}/favorite`,
    check: (locationId: string) => `${API_BASE}/locations/${locationId}/favorite/check`,
  },

  ratings: {
    byLocation: (locationId: string) => `${API_BASE}/locations/${locationId}/ratings`,
    average: (locationId: string) => `${API_BASE}/locations/${locationId}/ratings/average`,
  },

  comments: {
    byLocation: (locationId: string) => `${API_BASE}/locations/${locationId}/comments`,
    byId: (locationId: string, commentId: string) =>
      `${API_BASE}/locations/${locationId}/comments/${commentId}`,
  },

  admin: {
    base: `${API_BASE}/admin`,
    dashboard: `${API_BASE}/admin/dashboard`,
    dashboardStats: `${API_BASE}/admin/dashboard/stats`,
    pendingLocations: `${API_BASE}/admin/pending-locations`,
    approveLocation: (id: string) => `${API_BASE}/admin/approve-location/${id}`,
    rejectLocation: (id: string) => `${API_BASE}/admin/reject-location/${id}`,
  },

  leaderboard: {
    base: `${API_BASE}/leaderboard`,
  },

  notifications: {
    base: `${API_BASE}/notifications`,
    markAsRead: (id: string) => `${API_BASE}/notifications/${id}/read`,
    markAllAsRead: `${API_BASE}/notifications/mark-all-read`,
  },
} as const;
