// Get environment variables
const API_URL = process.env.REACT_APP_API_URL || 'https://quiz-app-backend-new.vercel.app';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Log environment for debugging
console.log('Environment Configuration:', {
  NODE_ENV,
  API_URL,
  timestamp: new Date().toISOString()
});

const config = {
  API_URL,
  APP_NAME: 'QuizApp',
  APP_VERSION: '1.0.0',
  API_TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000', 10),
  AUTH: {
    TOKEN_KEY: 'token',
    USERNAME_KEY: 'username',
    STORAGE_TYPE: 'localStorage'
  }
};

// Log full configuration in development
if (NODE_ENV === 'development') {
  console.log('Full Configuration:', {
    ...config,
    timestamp: new Date().toISOString()
  });
}

export default config;
