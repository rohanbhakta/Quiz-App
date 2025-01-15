import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  CircularProgress,
  Alert,
  useTheme,
  Fab,
  Tooltip,
  Zoom,
  Grow,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Share as ShareIcon,
  Leaderboard as LeaderboardIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  Group as GroupIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { api } from '../services/api';

const StatCard = ({ icon: Icon, title, value, delay }) => {
  const theme = useTheme();
  
  return (
    <Grow in timeout={600} style={{ transformOrigin: '0 0 0' }} {...{ timeout: 1000 + delay }}>
      <Card sx={{
        height: '100%',
        background: theme.palette.gradient.background,
        borderRadius: 3,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        }
      }}>
        <CardContent sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <Box sx={{
            p: 2,
            mb: 2,
            borderRadius: '50%',
            background: theme.palette.gradient.primary,
          }}>
            <Icon sx={{ fontSize: 40, color: 'white' }} />
          </Box>
          <Typography variant="h4" sx={{ mb: 1, fontWeight: 600 }}>
            {value}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {title}
          </Typography>
        </CardContent>
      </Card>
    </Grow>
  );
};

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const data = await api.getUserQuizzes();
        setQuizzes(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch your quizzes');
        console.error('Error fetching quizzes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleDeleteQuiz = async (quizId) => {
    try {
      await api.deleteQuiz(quizId);
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
    } catch (err) {
      setError('Failed to delete quiz');
      console.error('Error deleting quiz:', err);
    }
  };

  const totalParticipants = quizzes.reduce((acc, quiz) => acc + (quiz.participants || 0), 0);
  const averageQuestions = quizzes.length ? 
    Math.round(quizzes.reduce((acc, quiz) => acc + quiz.questions.length, 0) / quizzes.length) : 0;
  const averageTime = quizzes.length ?
    Math.round(quizzes.reduce((acc, quiz) => 
      acc + quiz.questions.reduce((sum, q) => sum + q.timer, 0), 0) / quizzes.length) : 0;

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ pt: 4, pb: 6 }}>
        <Typography 
          variant="h2" 
          gutterBottom
          sx={{
            background: theme.palette.gradient.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 6,
            textAlign: 'center',
            fontWeight: 700
          }}
        >
          My Quiz Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={QuizIcon}
              title="Total Quizzes"
              value={quizzes.length}
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={GroupIcon}
              title="Total Participants"
              value={totalParticipants}
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={QuizIcon}
              title="Avg. Questions"
              value={averageQuestions}
              delay={400}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={TimerIcon}
              title="Avg. Duration (sec)"
              value={averageTime}
              delay={600}
            />
          </Grid>
        </Grid>

        <Typography 
          variant="h4" 
          sx={{ 
            mb: 4,
            fontWeight: 600,
            color: theme.palette.text.primary
          }}
        >
          My Quizzes
        </Typography>

        <Grid container spacing={4}>
          {quizzes.map((quiz, index) => (
            <Grid item xs={12} sm={6} md={4} key={quiz.id}>
              <Zoom in timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
                <Card sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: theme.palette.gradient.background,
                  borderRadius: 3,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                  }
                }}>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography 
                      variant="h5" 
                      gutterBottom
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.primary.main
                      }}
                    >
                      {quiz.title}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {quiz.questions.length} Questions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created: {new Date(quiz.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    <Box>
                      <Tooltip title="Share Quiz">
                        <IconButton
                          onClick={() => navigate(`/quiz/${quiz.id}/share`)}
                          sx={{ 
                            mr: 1,
                            background: theme.palette.action.hover,
                            '&:hover': { background: theme.palette.action.selected }
                          }}
                        >
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Results">
                        <IconButton
                          onClick={() => navigate(`/quiz/${quiz.id}/results`)}
                          sx={{ 
                            background: theme.palette.action.hover,
                            '&:hover': { background: theme.palette.action.selected }
                          }}
                        >
                          <LeaderboardIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Tooltip title="Delete Quiz">
                      <IconButton
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        sx={{ 
                          color: theme.palette.error.main,
                          '&:hover': { 
                            background: theme.palette.error.light,
                            color: theme.palette.error.dark
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>

        {quizzes.length === 0 && !error && (
          <Paper sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 4,
            backgroundColor: 'rgba(0,0,0,0.02)',
            borderRadius: 3,
            border: `1px dashed ${theme.palette.divider}`
          }}>
            <QuizIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              You haven't created any quizzes yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Create your first quiz and start engaging with participants
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create')}
              sx={{
                py: 1.5,
                px: 4,
                background: theme.palette.gradient.primary,
                '&:hover': {
                  background: theme.palette.gradient.hover,
                }
              }}
            >
              Create Your First Quiz
            </Button>
          </Paper>
        )}
      </Box>

      <Tooltip title="Create New Quiz" placement="left">
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            background: theme.palette.gradient.primary,
            '&:hover': {
              background: theme.palette.gradient.hover,
            }
          }}
          onClick={() => navigate('/create')}
        >
          <AddIcon />
        </Fab>
      </Tooltip>
    </Container>
  );
};

export default Dashboard;
