export const APP_ROUTES = {
  auth: {
    login: '/login',
    register: '/register',
  },

  user: {
    profile: (id: string) => ['/profile', id],
  },
  
  app: {
    home: '/',
    submit: '/submit',
    favorites: '/favorites',
    leaderboard: '/leaderboard',
  },
} as const;
