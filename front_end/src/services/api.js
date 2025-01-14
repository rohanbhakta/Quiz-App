import axios from 'axios';
import config from '../config';

// Create axios instance with custom config
const axiosInstance = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  // Force HTTP protocol and disable HTTPS
  protocol: 'http',
  httpsAgent: null
});

// Log the actual baseURL being used
console.log('API Base URL:', config.API_URL);

export const api = {
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
      const response = await axiosInstance.post('/quizzes', {
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
      const response = await axiosInstance.get(`/quizzes/${id}`);
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
      const response = await axiosInstance.post(`/quizzes/${quizId}/join`, { name });
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
      const response = await axiosInstance.post(`/quizzes/${quizId}/submit`, { 
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
      const response = await axiosInstance.get(`/quizzes/${quizId}/results`);
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
