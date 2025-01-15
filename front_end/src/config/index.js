const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  API_URL: process.env.REACT_APP_API_URL || (isDevelopment ? 'http://localhost:5003' : 'https://quiz-app-backend.vercel.app'),
  APP_NAME: 'QuizApp',
  APP_VERSION: '1.0.0',
  API_TIMEOUT: 10000,
  AUTH: {
    TOKEN_KEY: 'token',
    USERNAME_KEY: 'username',
    STORAGE_TYPE: 'localStorage' // or 'sessionStorage'
  }
};

// Log configuration in development
if (isDevelopment) {
  console.log('App Configuration:', {
    environment: process.env.NODE_ENV,
    apiUrl: config.API_URL
  });
}

export default config;
