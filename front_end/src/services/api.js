import axios from 'axios';
import config from '../config';

// Create axios instance with custom config
const axiosInstance = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000
});

// Log configuration
console.log('API Configuration:', {
  baseURL: config.API_URL,
  headers: axiosInstance.defaults.headers
});

// Add token to requests if it exists
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Log the actual baseURL being used
console.log('API Base URL:', config.API_URL);

export const api = {
  // Auth methods
  signUp: async (email, username, password) => {
    try {
      console.log('Attempting signup with:', { email, username });
      const response = await axiosInstance.post('/api/auth/signup', { email, username, password });
      return response.data;
    } catch (error) {
      console.error('Signup failed:', error.response?.data);
      throw error;
    }
  },

  signIn: async (emailOrUsername, password) => {
    try {
      console.log('Attempting signin with:', { emailOrUsername });
      const response = await axiosInstance.post('/api/auth/signin', { emailOrUsername, password });
      console.log('Signin response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Signin failed:', error.response?.data);
      throw error;
    }
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
