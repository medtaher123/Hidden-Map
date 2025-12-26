export const APP_ROUTES = {
  auth: {
    login: '/login',
    register: '/register',
  },

  user: {
    profile: '/profile',
  },

  app: {
    home: '/',
    submit: '/submit',
    favorites: '/favorites',
    leaderboard: '/leaderboard',
  },
} as const;
