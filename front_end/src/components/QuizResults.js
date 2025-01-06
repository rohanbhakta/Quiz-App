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
  Grid
} from '@mui/material';
import { api } from '../services/api';

const QuizResults = () => {
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

  const sortedResults = [...results].sort((a, b) => b.score - a.score);
  const totalParticipants = sortedResults.length;
  const averageScore = totalParticipants > 0
    ? sortedResults.reduce((acc, curr) => acc + curr.score, 0) / totalParticipants
    : 0;

  return (
    <Container maxWidth="md">
      <Box 
        sx={{ 
          mt: 6,
          mb: 8,
          animation: 'fadeIn 0.6s ease-out'
        }}
      >
        <Typography 
          variant="h2" 
          gutterBottom
          sx={{
            background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
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
          sx={{ 
            mb: 6,
            textAlign: 'center'
          }}
        >
          {quiz.title}
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,51,141,0.12)',
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  color="primary" 
                  gutterBottom
                  sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: 500
                  }}
                >
                  Total Participants
                </Typography>
                <Typography 
                  variant="h3"
                  sx={{
                    background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
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
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,51,141,0.12)',
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  color="primary" 
                  gutterBottom
                  sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: 500
                  }}
                >
                  Average Score
                </Typography>
                <Typography 
                  variant="h3"
                  sx={{
                    background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
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
          <Grid item xs={12} sm={4}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,51,141,0.12)',
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  color="primary" 
                  gutterBottom
                  sx={{ 
                    fontSize: '1.1rem',
                    fontWeight: 500
                  }}
                >
                  Total Questions
                </Typography>
                <Typography 
                  variant="h3"
                  sx={{
                    background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontWeight: 600
                  }}
                >
                  {quiz.questions.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper 
          sx={{ 
            mt: 4,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,51,141,0.12)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
            overflow: 'hidden'
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)' }}>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Rank</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 600 }}>Player</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Score</TableCell>
                  <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedResults.map((result, index) => (
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
                      transition: 'transform 0.2s, background-color 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(0,51,141,0.05)',
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
                            {['🏆', '🥈', '🥉'][index]}
                          </Typography>
                        )}
                        <Typography 
                          variant="body1" 
                          sx={{
                            fontWeight: index < 3 ? 600 : 400,
                            color: index < 3 ? '#00338D' : 'inherit'
                          }}
                        >
                          {index + 1}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{result.player.name}</TableCell>
                    <TableCell align="right">
                      {result.score} / {quiz.questions.length}
                    </TableCell>
                    <TableCell align="right">
                      {Math.round((result.score / quiz.questions.length) * 100)}%
                    </TableCell>
                  </TableRow>
                ))}
                {sortedResults.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
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
