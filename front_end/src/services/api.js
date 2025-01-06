import axios from 'axios';
import config from '../config';

// Create axios instance with custom config
const axiosInstance = axios.create({
  baseURL: config.API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const api = {
  // Create a new quiz
  createQuiz: async (title, questions) => {
    const response = await axiosInstance.post('/quizzes', { title, questions });
    return response.data;
  },

  // Get a quiz by ID
  getQuiz: async (id) => {
    const response = await axiosInstance.get(`/quizzes/${id}`);
    return response.data;
  },

  // Join a quiz as a player
  joinQuiz: async (quizId, name) => {
    const response = await axiosInstance.post(`/quizzes/${quizId}/join`, { name });
    return response.data;
  },

  // Submit quiz answers
  submitAnswers: async (quizId, playerId, answers) => {
    const response = await axiosInstance.post(`/quizzes/${quizId}/submit`, { playerId, answers });
    return response.data;
  },

  // Get quiz results
  getResults: async (quizId) => {
    const response = await axiosInstance.get(`/quizzes/${quizId}/results`);
    return response.data;
  }
};
