const API_BASE = `http://localhost:3000`;

export const API_ROUTES = {
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
} as const;
