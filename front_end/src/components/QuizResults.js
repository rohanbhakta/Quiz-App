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

  const sortedResults = [...results].sort((a, b) => b.score - a.score);
  const totalParticipants = sortedResults.length;
  const averageScore = totalParticipants > 0
    ? sortedResults.reduce((acc, curr) => acc + curr.score, 0) / totalParticipants
    : 0;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          {quiz.title} - Results
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Participants
                </Typography>
                <Typography variant="h4">
                  {totalParticipants}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Average Score
                </Typography>
                <Typography variant="h4">
                  {(averageScore / quiz.questions.length * 100).toFixed(1)}%
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Questions
                </Typography>
                <Typography variant="h4">
                  {quiz.questions.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ mt: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Player</TableCell>
                  <TableCell align="right">Score</TableCell>
                  <TableCell align="right">Percentage</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedResults.map((result, index) => (
                  <TableRow 
                    key={index}
                    sx={index < 3 ? { 
                      backgroundColor: [
                        'rgba(255, 215, 0, 0.1)',
                        'rgba(192, 192, 192, 0.1)',
                        'rgba(205, 127, 50, 0.1)'
                      ][index]
                    } : {}}
                  >
                    <TableCell>
                      <Typography variant="body1" fontWeight={index < 3 ? 'bold' : 'normal'}>
                        {index + 1}
                      </Typography>
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
