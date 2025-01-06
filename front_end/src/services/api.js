import axios from 'axios';
import config from '../config';

const API_URL = config.API_URL;

export const api = {
  // Create a new quiz
  createQuiz: async (title, questions) => {
    const response = await axios.post(`${API_URL}/quizzes`, { title, questions });
    return response.data;
  },

  // Get a quiz by ID
  getQuiz: async (id) => {
    const response = await axios.get(`${API_URL}/quizzes/${id}`);
    return response.data;
  },

  // Join a quiz as a player
  joinQuiz: async (quizId, name) => {
    const response = await axios.post(`${API_URL}/quizzes/${quizId}/join`, { name });
    return response.data;
  },

  // Submit quiz answers
  submitAnswers: async (quizId, playerId, answers) => {
    const response = await axios.post(`${API_URL}/quizzes/${quizId}/submit`, { playerId, answers });
    return response.data;
  },

  // Get quiz results
  getResults: async (quizId) => {
    const response = await axios.get(`${API_URL}/quizzes/${quizId}/results`);
    return response.data;
  }
};
