import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  CircularProgress,
  Alert,
  LinearProgress,
  Fade,
  CircularProgress as MuiCircularProgress,
  useTheme
} from '@mui/material';
import { api } from '../services/api';

const PlayQuiz = () => {
  const theme = useTheme();
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
  const [timeLeft, setTimeLeft] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);
  const audioRef = useRef(null);
  const timerRef = useRef({ intervalId: null, startTime: null });

  // Audio setup for timer sound
  useEffect(() => {
    let audioContext = null;
    let oscillator = null;
    let gainNode = null;

    const setupAudio = () => {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      oscillator = audioContext.createOscillator();
      gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.type = 'square';
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);

      oscillator.start();

      audioRef.current = {
        context: audioContext,
        oscillator,
        gainNode,
        playBeep: (timeLeft) => {
          const now = audioContext.currentTime;
          const frequency = timeLeft <= 3 ? 880 : 440;
          const duration = timeLeft <= 3 ? 0.2 : 0.1;
          
          oscillator.frequency.setValueAtTime(frequency, now);
          gainNode.gain.cancelScheduledValues(now);
          gainNode.gain.setValueAtTime(0, now);
          gainNode.gain.linearRampToValueAtTime(0.3, now + 0.01);
          gainNode.gain.linearRampToValueAtTime(0, now + duration);
        }
      };
    };

    setupAudio();

    return () => {
      if (oscillator) oscillator.stop();
      if (audioContext) audioContext.close();
    };
  }, []);

  const handleSubmit = useCallback(async (finalAnswers) => {
    setSubmitting(true);
    try {
      if (id && playerId) {
        await api.submitAnswers(id, playerId, finalAnswers);
        navigate(`/quiz/${id}/results`);
      }
    } catch (err) {
      setError('Failed to submit answers. Please try again.');
      setSubmitting(false);
    }
  }, [id, playerId, navigate]);

  const handleAnswerSelect = useCallback(async (questionId, selectedOption, responseTime = null) => {
    try {
      // Calculate response time in milliseconds
      const currentTime = Date.now();
      if (!responseTime) {
        responseTime = currentTime - questionStartTime;
      }

      console.log('Answer selection:', {
        questionId,
        selectedOption,
        responseTime,
        startTime: questionStartTime,
        endTime: currentTime,
        currentQuestion
      });

      // Validate response time
      const maxAllowedTime = quiz.questions[currentQuestion].timer * 1000;
      const validatedTime = Math.min(responseTime, maxAllowedTime);

      const newAnswers = [...answers, { 
        questionId, 
        selectedOption,
        responseTime: validatedTime
      }];
      setAnswers(newAnswers);
      
      if (quiz && currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        await handleSubmit(newAnswers);
      }
    } catch (error) {
      setError('Failed to process answer. Please try again.');
    }
  }, [answers, currentQuestion, quiz, questionStartTime, handleSubmit]);

  const handleTimeUp = useCallback(() => {
    console.log('Time up for question:', currentQuestion);
    if (quiz && currentQuestion < quiz.questions.length) {
      const question = quiz.questions[currentQuestion];
      const maxTime = question.timer * 1000;
      console.log('Auto-submitting answer with max time:', maxTime);
      handleAnswerSelect(question.id, -1, maxTime);
    }
  }, [quiz, currentQuestion, handleAnswerSelect]);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        if (id) {
          const quizData = await api.getQuiz(id);
          const validatedQuizData = {
            ...quizData,
            questions: quizData.questions.map(q => ({
              ...q,
              timer: Math.min(Math.max(q.timer || 30, 5), 300)
            }))
          };
          setQuiz(validatedQuizData);
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

  // Initialize timer when question changes
  useEffect(() => {
    const startTimer = () => {
      if (!quiz || !playerId || currentQuestion >= quiz.questions.length) return;

      // Clear existing timer
      if (timerRef.current.intervalId) {
        clearInterval(timerRef.current.intervalId);
      }

      // Get timer duration from question
      const duration = quiz.questions[currentQuestion].timer;
      console.log(`Starting timer for question ${currentQuestion + 1}:`, duration);

      // Set initial state
      const startTime = Date.now();
      timerRef.current = { intervalId: null, startTime };

      setTimeLeft(duration);
      setQuestionStartTime(startTime);
      setShowTimeWarning(false);

      // Start countdown with higher resolution
      const intervalId = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        const remaining = duration - elapsed;

        if (remaining <= 0) {
          clearInterval(intervalId);
          handleTimeUp();
          setTimeLeft(0);
        } else {
          setTimeLeft(remaining);
          if (remaining <= 5 && audioRef.current) {
            setShowTimeWarning(true);
            audioRef.current.playBeep(remaining);
          }
        }
      }, 50); // Update every 50ms for smoother countdown

      timerRef.current.intervalId = intervalId;
    };

    startTimer();

    // Cleanup
    return () => {
      if (timerRef.current.intervalId) {
        clearInterval(timerRef.current.intervalId);
        timerRef.current.intervalId = null;
      }
    };
  }, [quiz, playerId, currentQuestion, handleTimeUp]);

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

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 2 }}>
          <CircularProgress 
            size={60}
            sx={{ 
              color: theme.palette.primary.light,
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }}
          />
          <Typography variant="h6" color="text.secondary">
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
        <Box sx={{ mt: 8 }}>
          <Paper sx={{ 
            p: 4,
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            background: theme.palette.gradient.background,
          }}>
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{
                background: theme.palette.gradient.primary,
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
                  background: theme.palette.gradient.primary,
                  '&:hover': {
                    background: theme.palette.gradient.hover,
                  },
                  '&.Mui-disabled': {
                    background: theme.palette.action.disabledBackground,
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
  const timerProgress = timeLeft ? (timeLeft / question.timer) * 100 : 0;

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
              backgroundColor: theme.palette.divider,
              '& .MuiLinearProgress-bar': {
                background: theme.palette.gradient.primary,
                borderRadius: 4,
              }
            }} 
          />
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ position: 'absolute', right: 0, top: '100%', mt: 1 }}
          >
            Question {currentQuestion + 1} of {quiz.questions.length}
          </Typography>
        </Box>

        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <MuiCircularProgress
              variant="determinate"
              value={timerProgress}
              size={80}
              thickness={4}
              sx={{
                color: timerProgress <= 25 ? '#dc0000' : theme.palette.primary.main,
                transition: 'color 0.3s ease',
              }}
            />
            <Box sx={{
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Typography
                variant="h4"
                component="div"
                sx={{ 
                  color: timerProgress <= 25 ? '#dc0000' : theme.palette.primary.main,
                  fontWeight: 600,
                  animation: showTimeWarning ? 'shake 0.5s infinite' : 'none',
                  '@keyframes shake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-2px)' },
                    '75%': { transform: 'translateX(2px)' },
                  }
                }}
              >
                {timeLeft}
              </Typography>
            </Box>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={timerProgress} 
            sx={{ 
              flexGrow: 1,
              height: 8,
              borderRadius: 4,
              backgroundColor: theme.palette.divider,
              '& .MuiLinearProgress-bar': {
                background: timerProgress <= 25 
                  ? 'linear-gradient(90deg, #dc0000 0%, #ff4d4d 100%)'
                  : theme.palette.gradient.primary,
                borderRadius: 4,
                transition: 'all 1s linear'
              }
            }} 
          />
        </Box>

        <Fade in={true} timeout={300}>
          <Paper sx={{ 
            p: 4,
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            background: theme.palette.gradient.background,
          }}>
            <Typography 
              variant="h5" 
              sx={{
                color: theme.palette.primary.main,
                mb: 4,
                fontWeight: 600
              }}
            >
              {question.text}
            </Typography>
            <FormControl component="fieldset" sx={{ width: '100%' }}>
              <RadioGroup>
                {question.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={index.toString()}
                    control={
                      <Radio 
                        sx={{
                          '&.Mui-checked': {
                            color: theme.palette.primary.main,
                          }
                        }}
                      />
                    }
                    label={option}
                    onClick={() => handleAnswerSelect(question.id, index)}
                    disabled={submitting || timeLeft === 0}
                    sx={{
                      m: 0,
                      p: 2,
                      width: '100%',
                      borderRadius: 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
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
        </Fade>
      </Box>
    </Container>
  );
};

export default PlayQuiz;
