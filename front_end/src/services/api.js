import axios from 'axios';
import config from '../config';

// Log API configuration
console.log('API Service Configuration:', {
  baseURL: config.API_URL,
  timestamp: new Date().toISOString()
});

// Create axios instance with custom config
const axiosInstance = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: config.API_TIMEOUT || 30000,
  withCredentials: false
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Log request
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      timestamp: new Date().toISOString()
    });

    // Add auth token if available
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('Request Error:', {
      error: error.message,
      timestamp: new Date().toISOString()
    });
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      timestamp: new Date().toISOString()
    });
    return response;
  },
  (error) => {
    // Log error details
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      timestamp: new Date().toISOString()
    });

    // Handle specific error cases
    if (error.response) {
      // Server responded with error
      const message = error.response.data?.message || 'Server error occurred';
      
      // Handle unauthorized
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('username');
        window.location.href = '/signin';
      }
      
      throw new Error(message);
    } else if (error.request) {
      // Request made but no response
      throw new Error('Unable to reach the server. Please check your connection.');
    } else {
      // Request setup error
      throw new Error('Failed to make request. Please try again.');
    }
  }
);

export const api = {
  // Auth methods
  signUp: async (email, username, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/signup', {
        email: email.trim(),
        username: username.trim(),
        password
      });
      return response.data;
    } catch (error) {
      console.error('Signup failed:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  signIn: async (emailOrUsername, password) => {
    try {
      const response = await axiosInstance.post('/api/auth/signin', {
        emailOrUsername: emailOrUsername.trim(),
        password
      });
      return response.data;
    } catch (error) {
      console.error('Signin failed:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  verifyToken: async () => {
    try {
      const response = await axiosInstance.post('/api/auth/verify');
      return response.data;
    } catch (error) {
      console.error('Token verification failed:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  getUserQuizzes: async () => {
    try {
      const response = await axiosInstance.get('/api/quizzes/user');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user quizzes:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  deleteQuiz: async (quizId) => {
    try {
      await axiosInstance.delete(`/api/quizzes/${quizId}`);
    } catch (error) {
      console.error('Failed to delete quiz:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  deleteAccount: async () => {
    try {
      await axiosInstance.delete('/api/auth/account');
    } catch (error) {
      console.error('Failed to delete account:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  createQuiz: async (title, questions, theme = 'blue', type = 'quiz') => {
    try {
      if (!title || !questions || !Array.isArray(questions)) {
        throw new Error('Invalid quiz data format');
      }

      const formattedQuestions = questions.map(q => ({
        text: q.text.trim(),
        options: q.options.map(opt => opt.trim()).filter(opt => opt !== ''),
        correctAnswer: Number(q.correctAnswer),
        timer: Number(q.timer) || 30
      }));

      const response = await axiosInstance.post('/api/quizzes', {
        title: title.trim(),
        questions: formattedQuestions,
        theme,
        type
      });

      return response.data;
    } catch (error) {
      console.error('Failed to create quiz:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  getQuiz: async (id) => {
    try {
      const response = await axiosInstance.get(`/api/quizzes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch quiz:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  joinQuiz: async (quizId, name, avatar) => {
    try {
      const response = await axiosInstance.post(`/api/quizzes/${quizId}/join`, { name, avatar });
      return response.data;
    } catch (error) {
      console.error('Failed to join quiz:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

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
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  getResults: async (quizId) => {
    try {
      const response = await axiosInstance.get(`/api/quizzes/${quizId}/results`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch results:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  setQuizExpiration: async (quizId, durationMinutes) => {
    try {
      const response = await axiosInstance.post(`/api/quizzes/${quizId}/expiration`, { durationMinutes });
      return response.data;
    } catch (error) {
      console.error('Failed to set quiz expiration:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  },

  getUserAnswers: async (quizId, playerId) => {
    try {
      const response = await axiosInstance.get(`/api/quizzes/${quizId}/user-answers`, {
        params: playerId ? { playerId } : undefined
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user answers:', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
};
