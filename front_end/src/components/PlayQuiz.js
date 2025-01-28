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
} from '@mui/material';
import { Timer as TimerIcon } from '@mui/icons-material';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
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
  const [sessionTimeLeft, setSessionTimeLeft] = useState(null);
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
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const audioRef = useRef(null);

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
      if (!id || !playerId) {
        throw new Error('Missing quiz ID or player ID');
      }

      // Log the submission attempt
      console.log('Submitting answers:', {
        quizId: id,
        playerId,
        answersCount: finalAnswers.length
      });

      const response = await api.submitAnswers(id, playerId, finalAnswers);
      
      // Log successful submission
      console.log('Submission successful:', response);
      
      // Clear any existing errors
      setError(null);
      setSubmitting(false);
      
      // Store playerId and navigate to results
      localStorage.setItem('currentPlayerId', playerId);
      navigate(`/quiz/${id}/results?playerId=${playerId}`);
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to submit answers. Please try again.');
      setSubmitting(false);
    }
  }, [id, playerId, navigate]);

  const handleAnswerSelect = useCallback(async (questionId, selectedOption, responseTime = null) => {
    if (!quiz || !playerId) return;

    try {
      // Calculate response time in seconds
      const currentTime = Date.now();
      let responseTimeInSeconds;
      
      if (!responseTime) {
        // Convert milliseconds to seconds
        responseTimeInSeconds = (currentTime - questionStartTime) / 1000;
      } else {
        // If responseTime is provided (from handleTimeUp), it's already in milliseconds
        responseTimeInSeconds = responseTime / 1000;
      }

      // Validate response time (in seconds) if timer exists
      const questionTimer = quiz.questions[currentQuestion].timer;
      const validatedTime = questionTimer ? Math.min(responseTimeInSeconds, questionTimer) : responseTimeInSeconds;

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
        // Log the final answers before submission
        console.log('Final answers:', newAnswers);
        
        // Submit answers
        setSubmitting(true);
        try {
          await handleSubmit(newAnswers);
        } catch (submitError) {
          console.error('Failed to submit answers:', submitError);
          setError(submitError.message || 'Failed to submit answers. Please try again.');
        }
      }
    } catch (error) {
      console.error('Answer selection error:', error);
      setError('Failed to process answer. Please try again.');
    }
  }, [answers, currentQuestion, quiz, questionStartTime, handleSubmit, playerId]);

  const handleTimeUp = useCallback(() => {
    if (quiz && currentQuestion < quiz.questions.length) {
      const question = quiz.questions[currentQuestion];
      if (question.timer) {
        handleAnswerSelect(question.id, -1, question.timer);
      }
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
              timer: q.timer ? Math.min(Math.max(q.timer, 5), 300) : null
            }))
          };
          setQuiz(validatedQuizData);

          // Set session time left if quiz has expiration
          if (quizData.expirationTime) {
            const expirationTime = new Date(quizData.expirationTime);
            const timeLeft = expirationTime.getTime() - Date.now();
            if (timeLeft > 0) {
              setSessionTimeLeft(Math.floor(timeLeft / 1000)); // Convert to seconds
            }
          }

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

  useEffect(() => {
    if (quiz && playerId && currentQuestion < quiz.questions.length) {
      setQuestionStartTime(Date.now());
      setTimerKey(prev => prev + 1); // Reset timer
    }
  }, [quiz, playerId, currentQuestion]);

  // Update session time left
  useEffect(() => {
    if (sessionTimeLeft > 0) {
      const timer = setInterval(() => {
        setSessionTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            // Redirect to expired page
            setError('Quiz session has expired');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [sessionTimeLeft]);

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
          <Box sx={{ mt: 8, textAlign: 'center' }}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                '& .MuiAlert-message': {
                  fontSize: '1.1rem'
                }
              }}
            >
              {error === 'Quiz session has expired' 
                ? 'This quiz is no longer accessible. The session has expired.'
                : error}
            </Alert>
            <Typography variant="body1" color="text.secondary">
              Please contact the quiz creator for more information.
            </Typography>
          </Box>
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
              {sessionTimeLeft && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: 1,
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'rgba(0, 0, 0, 0.05)'
                }}>
                  <TimerIcon color="action" />
                  <Typography color="text.secondary">
                    Session expires in: {Math.floor(sessionTimeLeft / 60)}m {sessionTimeLeft % 60}s
                  </Typography>
                </Box>
              )}
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
            {sessionTimeLeft && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: 1,
                mb: 3,
                p: 2,
                borderRadius: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.05)'
              }}>
                <TimerIcon color="action" />
                <Typography color="text.secondary">
                  Session expires in: {Math.floor(sessionTimeLeft / 60)}m {sessionTimeLeft % 60}s
                </Typography>
              </Box>
            )}
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

            <Box 
              sx={{ 
                mb: 3,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                height: question?.timer ? '180px' : 'auto'
              }}
            >
              {quiz && question && question.timer ? (
                <CountdownCircleTimer
                  key={timerKey}
                  isPlaying={!!playerId}
                  duration={question.timer}
                  colors={['#00ff00', '#F7B801', '#A30000']}
                  colorsTime={[question.timer, question.timer / 2, 0]}
                  size={160}
                  strokeWidth={12}
                  trailStrokeWidth={12}
                  onComplete={handleTimeUp}
                  onUpdate={(remainingTime) => {
                    if (remainingTime <= 5 && audioRef.current) {
                      audioRef.current.playBeep(remainingTime);
                    }
                  }}
                >
                  {({ remainingTime, color }) => (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <TimerIcon sx={{ fontSize: 28, color }} />
                      <Typography
                        variant="h3"
                        sx={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          color,
                          lineHeight: 1
                        }}
                      >
                        {remainingTime}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'text.secondary',
                          fontWeight: 500 
                        }}
                      >
                        seconds
                      </Typography>
                    </Box>
                  )}
                </CountdownCircleTimer>
              ) : null}
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
                          disabled={submitting}
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
    </ThemeProvider>
  );
};

export default PlayQuiz;
