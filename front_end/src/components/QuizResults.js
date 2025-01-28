import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useParams, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Grid,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';
import { api } from '../services/api';
import { 
  EmojiEvents as TrophyIcon,
  Leaderboard as LeaderboardIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Poll as PollIcon
} from '@mui/icons-material';

const getAvatarUrl = (avatar) => {
  if (!avatar || typeof avatar === 'string') {
    return null;
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.seed}&backgroundColor=${avatar.backgroundColor.replace('#', '')}`;
};

const QuizResults = () => {
  const theme = useTheme();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const playerId = searchParams.get('playerId');
  const [results, setResults] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFireworks, setShowFireworks] = useState(false);
  const [currentTab, setCurrentTab] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const fireworksRef = useRef(null);

  useEffect(() => {
    if (results.length > 0 && !showFireworks && quiz?.type === 'quiz') {
      setShowFireworks(true);
      triggerFireworks();
    }

    return () => {
      if (fireworksRef.current) {
        cancelAnimationFrame(fireworksRef.current);
      }
    };
  }, [results, showFireworks, quiz?.type]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
          const [quizData, resultsData] = await Promise.all([
            api.getQuiz(id),
            api.getResults(id)
          ]);
          setQuiz(quizData);
          setResults(resultsData);

          if (quizData.type === 'quiz' && playerId) {
            try {
              const answersData = await api.getUserAnswers(id, playerId);
              console.log('Fetched user answers:', answersData);
              setUserAnswers(answersData || []);
              // Set initial tab to Report if we have answers
              if (answersData && answersData.length > 0) {
                setCurrentTab(1);
              }
            } catch (err) {
              console.error('Failed to fetch user answers:', err);
              setError('Failed to load your answers. Please try again.');
            }
          }
        }
      } catch (err) {
        setError('Failed to load results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(async () => {
      try {
        const resultsData = await api.getResults(id);
        setResults(resultsData);
      } catch (err) {
        console.error('Error polling results:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id, playerId]);

  const triggerFireworks = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#C0C0C0']
      });
      confetti({
        particleCount: 3,
        angle: 90,
        spread: 90,
        origin: { x: 0.5 },
        colors: ['#CD7F32']
      });

      if (Date.now() < end) {
        fireworksRef.current = requestAnimationFrame(frame);
      }
    };

    frame();
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  // Process answer distribution data
  const answerDistribution = useMemo(() => {
    if (!quiz?.questions || !results.length) {
      return [];
    }

    return quiz.questions.map((question, qIndex) => {
      const optionCounts = question.options.map((option, index) => ({
        option: `Option ${index + 1}`,
        text: option,
        count: 0
      }));

      results.forEach(result => {
        const answer = result.answers.find(a => a.questionId === question.id);
        if (answer !== undefined && answer.selectedOption >= 0) {
          optionCounts[answer.selectedOption].count++;
        }
      });

      return {
        questionText: question.text,
        options: optionCounts
      };
    });
  }, [quiz, results]);

  const formatTime = (seconds) => {
    return `${seconds.toFixed(1)}s`;
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8, gap: 2 }}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary">
            Loading Results...
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

  const totalParticipants = results.length;

  // For polls, only show the answer distribution
  if (quiz.type === 'poll') {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 6, mb: 8 }}>
          <Typography 
            variant="h2" 
            gutterBottom
            sx={{
              background: theme.palette.gradient.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              mb: 3
            }}
          >
            Poll Results
          </Typography>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ mb: 4, textAlign: 'center' }}
          >
            {quiz.title}
          </Typography>

          <Card sx={{
            background: theme.palette.gradient.background,
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            mb: 4
          }}>
            <CardContent sx={{ p: 3 }}>
              <Typography 
                color="primary" 
                gutterBottom
                sx={{ 
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <PollIcon /> Total Responses
              </Typography>
              <Typography 
                variant="h3"
                sx={{
                  background: theme.palette.gradient.primary,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 600
                }}
              >
                {totalParticipants}
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ mt: 4, mb: 6 }}>
            {answerDistribution.map((questionData, index) => (
              <Paper
                key={index}
                sx={{
                  p: 3,
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  background: theme.palette.gradient.background
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ mb: 2, fontWeight: 500 }}>
                  {questionData.questionText}
                </Typography>
                <Box sx={{ height: 300, width: '100%' }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={questionData.options}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="option"
                        tick={{ fill: theme.palette.text.primary }}
                      />
                      <YAxis 
                        label={{ 
                          value: 'Number of Responses', 
                          angle: -90, 
                          position: 'insideLeft',
                          fill: theme.palette.text.primary
                        }}
                        tick={{ fill: theme.palette.text.primary }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 1
                        }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <Box sx={{ p: 1.5, background: theme.palette.background.paper }}>
                                <Typography sx={{ mb: 1, fontWeight: 500 }}>
                                  {data.text}
                                </Typography>
                                <Typography color="text.secondary">
                                  Responses: {data.count}
                                </Typography>
                              </Box>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill={theme.palette.primary.main}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Container>
    );
  }

  // For quizzes, show the full leaderboard and report tabs
  const averageScore = totalParticipants > 0
    ? results.reduce((acc, curr) => acc + curr.score, 0) / totalParticipants
    : 0;

  return (
    <Container maxWidth="md">
      <Box sx={{ 
        mt: 6, 
        mb: 8,
        '@keyframes fadeIn': {
          '0%': {
            opacity: 0,
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: 1,
            transform: 'translateY(0)'
          }
        },
        '@keyframes bounce': {
          '0%, 100%': {
            transform: 'translateY(0)'
          },
          '50%': {
            transform: 'translateY(-5px)'
          }
        }
      }}>
        <Typography 
          variant="h2" 
          gutterBottom
          sx={{
            background: theme.palette.gradient.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            mb: 3,
            animation: 'fadeIn 0.8s ease-out'
          }}
        >
          Quiz Results
        </Typography>
        <Typography 
          variant="h5" 
          color="text.secondary" 
          sx={{ 
            mb: 4, 
            textAlign: 'center',
            animation: 'fadeIn 0.8s ease-out 0.2s backwards'
          }}
        >
          {quiz.title}
        </Typography>

        <Paper 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            mb: 3,
            animation: 'fadeIn 0.8s ease-out 0.4s backwards'
          }}
        >
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              background: theme.palette.gradient.background,
              '& .MuiTab-root': {
                py: 2
              }
            }}
          >
            <Tab 
              icon={<LeaderboardIcon />} 
              label="Leaderboard" 
              iconPosition="start"
            />
            <Tab 
              icon={<AssignmentIcon />} 
              label="Report" 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {currentTab === 0 ? (
          <Box sx={{ mt: 6, mb: 8 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{
                  background: theme.palette.gradient.background,
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  height: '100%',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8]
                  },
                  animation: 'fadeIn 0.8s ease-out 0.4s backwards'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      color="primary" 
                      gutterBottom
                      sx={{ fontSize: '1.1rem', fontWeight: 500 }}
                    >
                      Total Participants
                    </Typography>
                    <Typography 
                      variant="h3"
                      sx={{
                        background: theme.palette.gradient.primary,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 600
                      }}
                    >
                      {totalParticipants}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{
                  background: theme.palette.gradient.background,
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  height: '100%',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8]
                  },
                  animation: 'fadeIn 0.8s ease-out 0.6s backwards'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      color="primary" 
                      gutterBottom
                      sx={{ 
                        fontSize: '1.1rem',
                        fontWeight: 500,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <TrophyIcon sx={{ animation: 'bounce 2s infinite' }} /> Top Player
                    </Typography>
                    {results.length > 0 ? (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          {getAvatarUrl(results[0].player.avatar) ? (
                            <Box
                              component="img"
                              src={getAvatarUrl(results[0].player.avatar)}
                              alt={`${results[0].player.name}'s avatar`}
                              sx={{ 
                                width: '48px',
                                height: '48px',
                                backgroundColor: results[0].player.avatar.backgroundColor,
                                borderRadius: '50%',
                                boxShadow: theme.shadows[2],
                                p: 0.5,
                                animation: 'bounce 2s infinite'
                              }}
                            />
                          ) : (
                            <Box sx={{ 
                              width: '48px',
                              height: '48px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '32px',
                              backgroundColor: theme.palette.background.paper,
                              borderRadius: '50%',
                              boxShadow: theme.shadows[2],
                              animation: 'bounce 2s infinite'
                            }}>
                              <span role="img" aria-label="Default user avatar">👤</span>
                            </Box>
                          )}
                          <Typography 
                            variant="h5"
                            sx={{
                              background: theme.palette.gradient.primary,
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              fontWeight: 600
                            }}
                          >
                            {results[0].player.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          Combined Score: {results[0].combinedScore.toFixed(1)}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No players yet
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{
                  background: theme.palette.gradient.background,
                  borderRadius: 2,
                  boxShadow: theme.shadows[4],
                  height: '100%',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[8]
                  },
                  animation: 'fadeIn 0.8s ease-out 0.8s backwards'
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      color="primary" 
                      gutterBottom
                      sx={{ fontSize: '1.1rem', fontWeight: 500 }}
                    >
                      Average Score
                    </Typography>
                    <Typography 
                      variant="h3"
                      sx={{
                        background: theme.palette.gradient.primary,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        fontWeight: 600
                      }}
                    >
                      {(averageScore / quiz.questions.length * 100).toFixed(1)}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper sx={{ 
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              background: theme.palette.gradient.background,
              overflow: 'hidden',
              animation: 'fadeIn 0.8s ease-out 1.2s backwards'
            }}>
              <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow sx={{ 
                      background: theme.palette.gradient.primary,
                      '& th': {
                        borderBottom: 'none'
                      }
                    }}>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rank</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Avatar</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 600 }}>Player</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Score</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Time Efficiency</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Combined Rating</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow 
                        key={index}
                        sx={{
                          ...index < 3 ? { 
                            background: [
                              'linear-gradient(90deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)',
                              'linear-gradient(90deg, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0.05) 100%)',
                              'linear-gradient(90deg, rgba(205, 127, 50, 0.15) 0%, rgba(205, 127, 50, 0.05) 100%)'
                            ][index]
                          } : {},
                          transition: 'all 0.3s',
                          '&:hover': {
                            backgroundColor: `${theme.palette.action.hover} !important`,
                            transform: 'scale(1.01)',
                          },
                          animation: `fadeIn 0.5s ease-out ${1.4 + index * 0.1}s backwards`
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {index < 3 && (
                              <Typography 
                                component="span" 
                                sx={{ 
                                  fontSize: '1.5rem',
                                  color: [
                                    '#FFD700',
                                    '#C0C0C0',
                                    '#CD7F32'
                                  ][index],
                                  animation: 'bounce 2s infinite',
                                  textShadow: '0 0 5px rgba(0,0,0,0.2)'
                                }}
                              >
                                <span role="img" aria-label={['Gold trophy', 'Silver medal', 'Bronze medal'][index]}>
                                  {['🏆', '🥈', '🥉'][index]}
                                </span>
                              </Typography>
                            )}
                            <Typography 
                              variant="h6" 
                              sx={{
                                fontWeight: index < 3 ? 700 : 400,
                                color: index < 3 ? theme.palette.primary.main : 'inherit',
                                textShadow: index < 3 ? '0 0 8px rgba(0,0,0,0.1)' : 'none'
                              }}
                            >
                              {index + 1}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {getAvatarUrl(result.player.avatar) ? (
                            <Box
                              component="img"
                              src={getAvatarUrl(result.player.avatar)}
                              alt={`${result.player.name}'s avatar`}
                              sx={{ 
                                width: index < 3 ? '48px' : '36px',
                                height: index < 3 ? '48px' : '36px',
                                backgroundColor: result.player.avatar.backgroundColor,
                                borderRadius: '50%',
                                boxShadow: theme.shadows[2],
                                p: 0.5,
                                transition: 'transform 0.2s',
                                '&:hover': {
                                  transform: 'scale(1.1)'
                                },
                                animation: index < 3 ? 'bounce 2s infinite' : 'none'
                              }}
                            />
                          ) : (
                            <Box sx={{ 
                              width: index < 3 ? '48px' : '36px',
                              height: index < 3 ? '48px' : '36px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: index < 3 ? '32px' : '24px',
                              backgroundColor: theme.palette.background.paper,
                              borderRadius: '50%',
                              boxShadow: theme.shadows[2],
                              animation: index < 3 ? 'bounce 2s infinite' : 'none'
                            }}>
                              <span role="img" aria-label="Default user avatar">👤</span>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography 
                            sx={{
                              fontWeight: index < 3 ? 600 : 400,
                              color: index < 3 ? theme.palette.primary.main : 'inherit'
                            }}
                          >
                            {result.player.name}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <Typography>
                              {result.score} / {quiz.questions.length}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'white',
                                backgroundColor: theme.palette.primary.main,
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontWeight: 500
                              }}
                            >
                              {Math.round((result.score / quiz.questions.length) * 100)}%
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {formatTime(result.averageResponseTime)}
                            </Typography>
                            <Typography 
                              variant="body2"
                              sx={{ 
                                backgroundColor: theme.palette.primary.light,
                                color: 'white',
                                px: 1,
                                py: 0.5,
                                borderRadius: 1,
                                fontWeight: 500
                              }}
                            >
                              {result.timeEfficiency}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="right">
                          <Typography 
                            sx={{ 
                              display: 'inline-block',
                              background: index < 3 
                                ? [
                                    'linear-gradient(45deg, #FFD700 30%, #FFA500 90%)',
                                    'linear-gradient(45deg, #C0C0C0 30%, #A9A9A9 90%)',
                                    'linear-gradient(45deg, #CD7F32 30%, #8B4513 90%)'
                                  ][index]
                                : theme.palette.gradient.primary,
                              color: 'white',
                              px: 2,
                              py: 0.5,
                              borderRadius: 1,
                              minWidth: 60,
                              textAlign: 'center',
                              fontWeight: index < 3 ? 700 : 600,
                              boxShadow: index < 3 ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                            }}
                          >
                            {result.combinedScore.toFixed(1)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {results.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No results yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        ) : (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {quiz.questions.map((question, qIndex) => {
                const userAnswer = userAnswers.find(a => a.questionId === question.id);
                const isCorrect = userAnswer?.selectedOption === question.correctAnswer;
                
                return (
                  <Paper
                    key={qIndex}
                    elevation={0}
                    sx={{
                      p: 3,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      animation: `fadeIn 0.5s ease-out ${0.1 * qIndex}s backwards`
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        Your Answer: {userAnswer ? question.options[userAnswer.selectedOption] : 'Not answered'}
                      </Typography>
                      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                        Correct Answer: {question.options[question.correctAnswer]}
                      </Typography>
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
                        Response time: {userAnswer?.responseTime.toFixed(1)}s
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
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default QuizResults;
