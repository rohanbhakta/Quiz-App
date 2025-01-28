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
  ThemeProvider,
  createTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { api } from '../services/api';
import AvatarCreator from './AvatarCreator';
import { createCustomTheme, themePresets } from '../theme';

// Create a light theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
  }
});

const PlayQuiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [quizTheme, setQuizTheme] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [avatarConfig, setAvatarConfig] = useState({
    style: 'avataaars',
    seed: Math.random().toString(36).substring(7),
    backgroundColor: '#FFFFFF',
    accessories: [],
    skinColor: '#F8D5C2',
    hairColor: '#000000',
    facialHair: '',
    clothing: 'blazerShirt',
    clothingColor: '#3498DB',
    hairStyle: 'shortHairShortFlat',
    eyebrows: 'default',
    eyes: 'default',
    mouth: 'default'
  });
  const [playerId, setPlayerId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const audioRef = useRef(null);
  const intervalRef = useRef(null);

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
    if (!quiz || !playerId) return;

    try {
      // Calculate response time in milliseconds
      const currentTime = Date.now();
      if (!responseTime) {
        responseTime = currentTime - questionStartTime;
      }

      // Validate response time
      const maxAllowedTime = quiz.questions[currentQuestion].timer * 1000;
      const validatedTime = Math.min(responseTime, maxAllowedTime);

      // Calculate score (0 for wrong answers, 1 for correct)
      const isCorrect = selectedOption === quiz.questions[currentQuestion].correctAnswer;
      const score = isCorrect ? 1 : 0;

      const newAnswers = [...answers, { 
        questionId, 
        selectedOption,
        responseTime: validatedTime,
        score: score
      }];
      setAnswers(newAnswers);
      
      if (quiz && currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
      } else {
        setShowReport(true);
        // Store playerId in localStorage before submitting
        localStorage.setItem('currentPlayerId', playerId);
        await handleSubmit(newAnswers);
      }
    } catch (error) {
      setError('Failed to process answer. Please try again.');
    }
  }, [answers, currentQuestion, quiz, questionStartTime, handleSubmit, playerId]);

  const handleTimeUp = useCallback(() => {
    if (quiz && currentQuestion < quiz.questions.length) {
      const question = quiz.questions[currentQuestion];
      const maxTime = question.timer * 1000;
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

          // Create custom theme based on quiz theme
          if (quizData.theme && themePresets[quizData.theme]) {
            const customTheme = createCustomTheme('light', themePresets[quizData.theme]);
            setQuizTheme(customTheme);
          }

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

  // Timer setup
  useEffect(() => {
    if (!quiz || !playerId || currentQuestion >= quiz.questions.length) {
      return;
    }

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const duration = quiz.questions[currentQuestion].timer;
    const start = Date.now();
    const end = start + duration * 1000;

    // Set initial states
    setQuestionStartTime(start);
    setTimeLeft(duration);

    // Update timer every 100ms
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((end - now) / 1000));
      
      setTimeLeft(remaining);

      if (remaining <= 5 && audioRef.current) {
        // Only beep on whole seconds
        if (Math.ceil(remaining) !== Math.ceil((end - (now - 100)) / 1000)) {
          audioRef.current.playBeep(remaining);
        }
      }

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        handleTimeUp();
      }
    }, 100);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [quiz, playerId, currentQuestion, handleTimeUp]);

  const handleJoin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (id) {
        const { playerId: newPlayerId } = await api.joinQuiz(id, playerName, avatarConfig);
        setPlayerId(newPlayerId);
        setError(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to join quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getBackgroundStyles = () => {
    if (!quizTheme) return {};
    return {
      background: quizTheme.palette.background.quiz,
      transition: 'background 0.3s ease'
    };
  };

  const getThemeColors = () => {
    if (!quizTheme) return null;
    return {
      primary: quizTheme.palette.primary.main,
      secondary: quizTheme.palette.secondary.main,
      background: quizTheme.palette.background.paper
    };
  };

  const renderQuizReport = () => {
    if (!quiz?.questions || !answers.length || answers.length !== quiz.questions.length) {
      return null;
    }

    return (
      <Dialog
        open={showReport}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: theme => theme.shadows[8],
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center',
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          Quiz Report
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {quiz.questions.map((question, qIndex) => {
              const userAnswer = answers[qIndex];
              const isCorrect = userAnswer?.selectedOption === question.correctAnswer;
              
              return (
                <Paper
                  key={qIndex}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      color: isCorrect ? 'success.main' : 'error.main'
                    }}
                  >
                    {isCorrect ? <CheckIcon /> : <CloseIcon />}
                    Question {qIndex + 1}
                  </Typography>
                  <Typography sx={{ mb: 2, fontWeight: 500 }}>
                    {question.text}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {question.options.map((option, oIndex) => (
                      <Paper
                        key={oIndex}
                        elevation={0}
                        sx={{
                          p: 2,
                          backgroundColor: theme => {
                            if (oIndex === question.correctAnswer) {
                              return 'success.light';
                            }
                            if (oIndex === userAnswer?.selectedOption && !isCorrect) {
                              return 'error.light';
                            }
                            return theme.palette.background.default;
                          },
                          color: theme => {
                            if (oIndex === question.correctAnswer || 
                                (oIndex === userAnswer?.selectedOption && !isCorrect)) {
                              return 'white';
                            }
                            return theme.palette.text.primary;
                          },
                          borderRadius: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <Typography>
                          {option}
                        </Typography>
                        {oIndex === question.correctAnswer && (
                          <Typography 
                            component="span" 
                            sx={{ 
                              ml: 'auto',
                              color: 'white',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <CheckIcon fontSize="small" /> Correct Answer
                          </Typography>
                        )}
                        {oIndex === userAnswer?.selectedOption && !isCorrect && (
                          <Typography 
                            component="span" 
                            sx={{ 
                              ml: 'auto',
                              color: 'white',
                              fontWeight: 600,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <CloseIcon fontSize="small" /> Your Answer
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Box>
                  <Box sx={{ 
                    mt: 2, 
                    pt: 2, 
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Typography color="text.secondary">
                      Response time: {(userAnswer?.responseTime / 1000).toFixed(1)}s
                    </Typography>
                    <Typography 
                      sx={{ 
                        ml: 'auto',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        backgroundColor: isCorrect ? 'success.main' : 'error.main',
                        color: 'white',
                        fontWeight: 500
                      }}
                    >
                      Score: {userAnswer?.score || 0}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button 
            onClick={() => navigate(`/quiz/${id}/results`)}
            variant="contained"
            fullWidth
            sx={{ py: 1.5 }}
          >
            View Leaderboard
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <ThemeProvider theme={lightTheme}>
        <Container>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 2 }}>
            <CircularProgress size={60} />
            <Typography variant="h6" color="text.secondary">
              Loading Quiz...
            </Typography>
          </Box>
        </Container>
      </ThemeProvider>
    );
  }

  if (error) {
    return (
      <ThemeProvider theme={lightTheme}>
        <Container>
          <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
        </Container>
      </ThemeProvider>
    );
  }

  if (!quiz) {
    return (
      <ThemeProvider theme={lightTheme}>
        <Container>
          <Alert severity="warning" sx={{ mt: 4 }}>Quiz not found</Alert>
        </Container>
      </ThemeProvider>
    );
  }

  if (!playerId) {
    return (
      <ThemeProvider theme={lightTheme}>
        <Box sx={{ minHeight: '100vh', ...getBackgroundStyles() }}>
          <Container maxWidth="md">
            <Box sx={{ mt: 8 }}>
              <Paper sx={{ 
                p: 4,
                borderRadius: 2,
                boxShadow: lightTheme.shadows[4],
                background: quizTheme?.palette.background.paper || lightTheme.palette.background.paper,
              }}>
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{
                    mb: 3,
                    textAlign: 'center',
                    fontWeight: 600,
                    color: quizTheme?.palette.primary.main || lightTheme.palette.primary.main
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
                    variant="outlined"
                    required
                    disabled={submitting}
                    autoComplete="off"
                    inputProps={{
                      autoComplete: 'off',
                      form: {
                        autoComplete: 'off',
                      },
                    }}
                  />
                  <Typography 
                    variant="subtitle1" 
                    color="text.secondary" 
                    sx={{ mt: 2, mb: 2 }}
                  >
                    Customize your avatar
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <AvatarCreator
                      value={avatarConfig}
                      onChange={setAvatarConfig}
                      themeColors={getThemeColors()}
                    />
                  </Box>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{ 
                      mt: 3,
                      py: 1.5,
                      background: quizTheme?.palette.primary.main || lightTheme.palette.primary.main,
                      '&:hover': {
                        background: quizTheme?.palette.primary.dark || lightTheme.palette.primary.dark,
                      }
                    }}
                    disabled={!playerName || submitting}
                  >
                    {submitting ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={20} />
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
        </Box>
      </ThemeProvider>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <ThemeProvider theme={lightTheme}>
      <Box sx={{ minHeight: '100vh', ...getBackgroundStyles() }}>
        <Container maxWidth="md">
          <Box sx={{ mt: 4 }}>
            <Box sx={{ position: 'relative', mb: 4 }}>
              <LinearProgress 
                variant="determinate" 
                value={progress} 
                sx={{ 
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: lightTheme.palette.divider,
                  '& .MuiLinearProgress-bar': {
                    background: quizTheme?.palette.primary.main || lightTheme.palette.primary.main,
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

            <Box sx={{ mb: 3 }}>
              <Box 
                sx={{ 
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '120px',
                  background: quizTheme?.palette.background.paper || lightTheme.palette.background.paper,
                  borderRadius: 2,
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    fontSize: '5rem',
                    color: timeLeft <= 5 ? '#dc0000' : (quizTheme?.palette.primary.main || lightTheme.palette.primary.main),
                    transition: 'color 0.3s ease',
                    animation: timeLeft <= 5 ? 'pulse 1s infinite' : 'none',
                    '@keyframes pulse': {
                      '0%': { opacity: 1, transform: 'scale(1)' },
                      '50%': { opacity: 0.7, transform: 'scale(1.05)' },
                      '100%': { opacity: 1, transform: 'scale(1)' }
                    }
                  }}
                >
                  {timeLeft}
                </Typography>
              </Box>
            </Box>

            <Fade in={true} timeout={300}>
              <Paper sx={{ 
                p: 4,
                borderRadius: 2,
                boxShadow: lightTheme.shadows[4],
                background: quizTheme?.palette.background.paper || lightTheme.palette.background.paper,
              }}>
                <Typography 
                  variant="h5" 
                  sx={{
                    mb: 4,
                    fontWeight: 600,
                    color: quizTheme?.palette.primary.main || lightTheme.palette.primary.main
                  }}
                >
                  {question.text}
                </Typography>
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <RadioGroup>
                    {question.options.map((option, index) => (
                      <Paper
                        key={index}
                        elevation={0}
                        sx={{
                          mb: 2,
                          backgroundColor: quizTheme?.palette.background.default || lightTheme.palette.background.default,
                          transition: 'all 0.2s',
                          '&:hover': {
                            backgroundColor: quizTheme?.palette.action.hover || lightTheme.palette.action.hover,
                          }
                        }}
                      >
                        <FormControlLabel
                          value={index.toString()}
                          control={
                            <Radio 
                              sx={{
                                '&.Mui-checked': {
                                  color: quizTheme?.palette.primary.main || lightTheme.palette.primary.main,
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
                            '&.Mui-disabled': {
                              opacity: 0.5,
                            }
                          }}
                        />
                      </Paper>
                    ))}
                  </RadioGroup>
                </FormControl>
              </Paper>
            </Fade>
          </Box>
        </Container>
      </Box>
      {renderQuizReport()}
    </ThemeProvider>
  );
};

export default PlayQuiz;
