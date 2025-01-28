import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
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
  useTheme
} from '@mui/material';
import { api } from '../services/api';
import { EmojiEvents as TrophyIcon } from '@mui/icons-material';

const getAvatarUrl = (avatar) => {
  if (!avatar || typeof avatar === 'string') {
    return null;
  }
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatar.seed}&backgroundColor=${avatar.backgroundColor.replace('#', '')}`;
};

const QuizResults = () => {
  const theme = useTheme();
  const { id } = useParams();
  const [results, setResults] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        }
      } catch (err) {
        setError('Failed to load results. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Poll for new results every 5 seconds
    const interval = setInterval(async () => {
      try {
        const resultsData = await api.getResults(id);
        setResults(resultsData);
      } catch (err) {
        console.error('Error polling results:', err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [id]);

  const formatTime = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
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
  const averageScore = totalParticipants > 0
    ? results.reduce((acc, curr) => acc + curr.score, 0) / totalParticipants
    : 0;

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
          Quiz Results
        </Typography>
        <Typography 
          variant="h5" 
          color="text.secondary" 
          sx={{ mb: 6, textAlign: 'center' }}
        >
          {quiz.title}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              background: theme.palette.gradient.background,
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              height: '100%',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
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
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
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
                  <TrophyIcon /> Top Player
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
                            p: 0.5
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
                          boxShadow: theme.shadows[2]
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
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
              }
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

        <Typography 
          variant="h5" 
          sx={{ 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: theme.palette.primary.main
          }}
        >
          <TrophyIcon /> Leaderboard
        </Typography>

        <Paper sx={{ 
          borderRadius: 2,
          boxShadow: theme.shadows[4],
          background: theme.palette.gradient.background,
          overflow: 'hidden'
        }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: theme.palette.gradient.primary }}>
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
                          'linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%)',
                          'linear-gradient(90deg, rgba(192, 192, 192, 0.1) 0%, rgba(192, 192, 192, 0.05) 100%)',
                          'linear-gradient(90deg, rgba(205, 127, 50, 0.1) 0%, rgba(205, 127, 50, 0.05) 100%)'
                        ][index]
                      } : {},
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {index < 3 && (
                          <Typography 
                            component="span" 
                            sx={{ 
                              fontSize: '1.2rem',
                              color: [
                                '#FFD700',
                                '#C0C0C0',
                                '#CD7F32'
                              ][index]
                            }}
                          >
                            <span role="img" aria-label={['Gold trophy', 'Silver medal', 'Bronze medal'][index]}>
                              {['🏆', '🥈', '🥉'][index]}
                            </span>
                          </Typography>
                        )}
                        <Typography 
                          variant="body1" 
                          sx={{
                            fontWeight: index < 3 ? 600 : 400,
                            color: index < 3 ? theme.palette.primary.main : 'inherit'
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
                            width: '36px',
                            height: '36px',
                            backgroundColor: result.player.avatar.backgroundColor,
                            borderRadius: '50%',
                            boxShadow: theme.shadows[2],
                            p: 0.5
                          }}
                        />
                      ) : (
                        <Box sx={{ 
                          width: '36px',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '24px',
                          backgroundColor: theme.palette.background.paper,
                          borderRadius: '50%',
                          boxShadow: theme.shadows[2]
                        }}>
                          <span role="img" aria-label="Default user avatar">👤</span>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{result.player.name}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        <Typography>
                          {result.score} / {quiz.questions.length}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            backgroundColor: theme.palette.action.hover,
                            px: 1,
                            py: 0.5,
                            borderRadius: 1
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
                            backgroundColor: theme.palette.action.hover,
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
                          background: theme.palette.gradient.primary,
                          color: 'white',
                          px: 2,
                          py: 0.5,
                          borderRadius: 1,
                          minWidth: 60,
                          textAlign: 'center'
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
    </Container>
  );
};

export default QuizResults;
