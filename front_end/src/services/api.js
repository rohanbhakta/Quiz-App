import axios from 'axios';
import config from '../config';

// Create axios instance with custom config
const axiosInstance = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  },
  timeout: config.API_TIMEOUT,
  withCredentials: false // Disable CORS credentials since we're using token-based auth
});

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('API Service Configuration:', {
    baseURL: config.API_URL,
    environment: process.env.NODE_ENV,
    timeout: config.API_TIMEOUT
  });
}

// Error handler
const handleError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'Server error occurred';
    if (error.response.status === 401) {
      // Clear auth data on unauthorized
      localStorage.removeItem(config.AUTH.TOKEN_KEY);
      localStorage.removeItem(config.AUTH.USERNAME_KEY);
      sessionStorage.removeItem(config.AUTH.TOKEN_KEY);
      sessionStorage.removeItem(config.AUTH.USERNAME_KEY);
      window.location.href = '/signin';
    }
    throw new Error(message);
  } else if (error.request) {
    // Request made but no response
    throw new Error('No response from server. Please check your connection.');
  } else {
    // Request setup error
    throw new Error('Failed to make request. Please try again.');
  }
};

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('API Configuration:', {
    baseURL: config.API_URL,
    timeout: config.API_TIMEOUT,
    headers: axiosInstance.defaults.headers
  });
}

// Add token to requests if it exists
axiosInstance.interceptors.request.use((config) => {
  // Log request in development
  if (process.env.NODE_ENV === 'development') {
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      timestamp: new Date().toISOString()
    });
  }

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error('Request interceptor error:', {
    message: error.message,
    config: error.config,
    timestamp: new Date().toISOString()
  });
  return Promise.reject(error);
});

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        timestamp: new Date().toISOString()
      });
    }
    return response;
  },
  (error) => {
    // Log error details
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      timestamp: new Date().toISOString()
    });

    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'Server error occurred';
      if (error.response.status === 401) {
        // Clear auth data on unauthorized
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('username');
        window.location.href = '/signin';
      }
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Request setup error
      throw new Error('Failed to make request. Please try again.');
    }
  }
);

export const api = {
  // Auth methods
  signUp: async (email, username, password) => {
    const response = await axiosInstance.post('/api/auth/signup', { email, username, password });
    return response.data;
  },

  signIn: async (emailOrUsername, password) => {
    const response = await axiosInstance.post('/api/auth/signin', { emailOrUsername, password });
    return response.data;
  },

  verifyToken: async () => {
    try {
      console.log('Verifying token');
      const response = await axiosInstance.post('/api/auth/verify');
      console.log('Token verification response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Token verification failed:', error.response?.data);
      throw error;
    }
  },

  getUserQuizzes: async () => {
    try {
      const response = await axiosInstance.get('/api/quizzes/user');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user quizzes:', error.response?.data);
      throw error;
    }
  },

  deleteQuiz: async (quizId) => {
    try {
      await axiosInstance.delete(`/api/quizzes/${quizId}`);
    } catch (error) {
      console.error('Failed to delete quiz:', error.response?.data);
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      await axiosInstance.delete('/api/auth/account');
    } catch (error) {
      console.error('Failed to delete account:', error.response?.data);
      throw error;
    }
  },

  // Create a new quiz
  createQuiz: async (title, questions) => {
    try {
      // Validate and format the request data
      if (!title || !questions || !Array.isArray(questions)) {
        throw new Error('Invalid quiz data format');
      }

      // Format questions to match backend schema
      const formattedQuestions = questions.map(q => ({
        text: q.text.trim(),
        options: q.options.map(opt => opt.trim()).filter(opt => opt !== ''),
        correctAnswer: Number(q.correctAnswer),
        timer: Number(q.timer) || 30 // Default to 30 seconds if not provided
      }));

      // Log request details
      console.log('Creating quiz with data:', {
        title: title.trim(),
        questions: formattedQuestions,
        baseURL: axiosInstance.defaults.baseURL
      });

      // Make the request
      const response = await axiosInstance.post('/api/quizzes', {
        title: title.trim(),
        questions: formattedQuestions
      });

      console.log('Quiz created successfully:', response.data);
      return response.data;
    } catch (error) {
      // Enhanced error logging
      console.error('Failed to create quiz:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL
      });

      // Rethrow with more context
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to create quiz'
      );
    }
  },

  // Get a quiz by ID
  getQuiz: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/quizzes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quiz:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error('Failed to fetch quiz');
    }
  },

  // Join a quiz as a player
  joinQuiz: async (quizId, name) => {
    try {
      const response = await axiosInstance.post(`/api/quizzes/${quizId}/join`, { name });
      return response.data;
    } catch (error) {
      console.error('Failed to join quiz:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error('Failed to join quiz');
    }
  },

  // Submit quiz answers
  submitAnswers: async (quizId, playerId, answers) => {
    try {
      const response = await axiosInstance.post(`/api/quizzes/${quizId}/submit`, { 
        playerId, 
        answers: answers.map(answer => ({
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
          responseTime: answer.responseTime
        }))
      });
      return response.data;
    } catch (error) {
      console.error('Failed to submit answers:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error('Failed to submit answers');
    }
  },

  // Get quiz results
  getResults: async (quizId) => {
    try {
      const response = await axiosInstance.get(`/api/quizzes/${quizId}/results`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch results:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw new Error('Failed to fetch results');
    }
  }
};
