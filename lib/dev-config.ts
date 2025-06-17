// Development configuration for temporary authentication bypass
export const DEV_CONFIG = {
  // Set to true for development mode (bypasses authentication)
  ENABLE_DEV_MODE: true,

  // Set to true to allow any credentials for login
  BYPASS_AUTH: true,

  // Set to false to disable sign up functionality
  ENABLE_SIGNUP: false,

  // Default admin credentials for quick access
  DEFAULT_ADMIN: {
    email: "admin@newsdikhao.com",
    password: "admin123",
  },

  // Development admin credentials (any email/password will work in dev mode)
  DEV_ADMIN: {
    email: "dev@newsdikhao.com",
    password: "dev123",
  },
}

// Helper function to check if we're in development mode
export const isDevMode = () => {
  return DEV_CONFIG.ENABLE_DEV_MODE && process.env.NODE_ENV === "development"
}

// Helper function to check if auth bypass is enabled
export const shouldBypassAuth = () => {
  return isDevMode() && DEV_CONFIG.BYPASS_AUTH
}

// Helper function to check if signup is enabled
export const isSignupEnabled = () => {
  return isDevMode() && DEV_CONFIG.ENABLE_SIGNUP
}
