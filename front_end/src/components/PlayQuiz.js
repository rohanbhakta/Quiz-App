import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  CircularProgress,
  Alert,
  LinearProgress
} from '@mui/material';
import { api } from '../services/api';

const PlayQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        if (id) {
          const quizData = await api.getQuiz(id);
          setQuiz(quizData);
          setError(null);
        }
      } catch (err) {
        setError('Failed to load quiz. Please check the quiz ID and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  const handleJoin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (id) {
        const { playerId: newPlayerId } = await api.joinQuiz(id, playerName);
        setPlayerId(newPlayerId);
        setError(null);
      }
    } catch (err) {
      setError('Failed to join quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerSelect = async (questionId, selectedOption) => {
    const newAnswers = [...answers, { questionId, selectedOption }];
    setAnswers(newAnswers);
    
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      await handleSubmit(newAnswers);
    }
  };

  const handleSubmit = async (finalAnswers) => {
    setSubmitting(true);
    try {
      if (id && playerId) {
        console.log('Submitting answers:', {
          quizId: id,
          playerId,
          answers: finalAnswers
        });
        const result = await api.submitAnswers(id, playerId, finalAnswers);
        console.log('Submission result:', result);
        navigate(`/quiz/${id}/results`);
      }
    } catch (err) {
      console.error('Error submitting answers:', err);
      setError('Failed to submit answers. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      </Container>
    );
  }

  if (!quiz) {
    return (
      <Container>
        <Alert severity="warning" sx={{ mt: 4 }}>Quiz not found</Alert>
      </Container>
    );
  }

  if (!playerId) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Join Quiz: {quiz.title}
            </Typography>
            <form onSubmit={handleJoin}>
              <TextField
                fullWidth
                label="Your Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                margin="normal"
                required
                disabled={submitting}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                disabled={!playerName || submitting}
              >
                {submitting ? 'Joining...' : 'Join Quiz'}
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <LinearProgress variant="determinate" value={progress} sx={{ mb: 2 }} />
        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </Typography>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend" sx={{ mb: 2 }}>{question.text}</FormLabel>
            <RadioGroup>
              {question.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index.toString()}
                  control={<Radio />}
                  label={option}
                  onClick={() => handleAnswerSelect(question.id, index)}
                  disabled={submitting}
                />
              ))}
            </RadioGroup>
          </FormControl>
        </Paper>
      </Box>
    </Container>
  );
};

export default PlayQuiz;
