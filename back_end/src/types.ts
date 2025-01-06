export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  createdAt: Date;
}

export interface Player {
  name: string;
  score: number;
}

export interface QuizResponse {
  playerId: string;
  quizId: string;
  answers: { questionId: string; selectedOption: number }[];
  score: number;
}
