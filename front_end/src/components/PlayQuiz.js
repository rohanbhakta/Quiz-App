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
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            mt: 8,
            gap: 2
          }}
        >
          <CircularProgress 
            size={60}
            sx={{ 
              color: '#00A0DC',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ animation: 'fadeIn 0.6s ease-out' }}
          >
            Loading Quiz...
          </Typography>
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
        <Box 
          sx={{ 
            mt: 8,
            animation: 'fadeIn 0.6s ease-out'
          }}
        >
          <Paper 
            sx={{ 
              p: 4,
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,51,141,0.12)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
            }}
          >
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{
                background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
                textAlign: 'center'
              }}
            >
              Join Quiz
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary"
              sx={{ mb: 4, textAlign: 'center' }}
            >
              {quiz.title}
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
                sx={{ 
                  mt: 3,
                  py: 1.5,
                  background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #002266 0%, #007AA6 100%)',
                  },
                  '&.Mui-disabled': {
                    background: '#e0e0e0',
                  }
                }}
                disabled={!playerName || submitting}
              >
                {submitting ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                    <span>Joining...</span>
                  </Box>
                ) : (
                  'Start Quiz'
                )}
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
        <Box sx={{ position: 'relative', mb: 4 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8,
              borderRadius: 4,
              backgroundColor: 'rgba(0,51,141,0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
                borderRadius: 4,
              }
            }} 
          />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              position: 'absolute',
              right: 0,
              top: '100%',
              mt: 1
            }}
          >
            Question {currentQuestion + 1} of {quiz.questions.length}
          </Typography>
        </Box>
        <Paper 
          sx={{ 
            p: 4,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,51,141,0.12)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
            animation: 'fadeIn 0.4s ease-out',
          }}
        >
          <Typography 
            variant="h5" 
            sx={{
              color: '#00338D',
              mb: 4,
              fontWeight: 600
            }}
          >
            {question.text}
          </Typography>
          <FormControl component="fieldset" sx={{ width: '100%' }}>
            <FormLabel component="legend" sx={{ mb: 2 }}>{question.text}</FormLabel>
            <RadioGroup>
              {question.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index.toString()}
                  control={
                    <Radio 
                      sx={{
                        '&.Mui-checked': {
                          color: '#00338D',
                        }
                      }}
                    />
                  }
                  label={option}
                  onClick={() => handleAnswerSelect(question.id, index)}
                  disabled={submitting}
                  sx={{
                    m: 0,
                    p: 2,
                    width: '100%',
                    borderRadius: 1,
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: 'rgba(0,51,141,0.05)',
                    },
                    '&.Mui-disabled': {
                      opacity: 0.5,
                    }
                  }}
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
