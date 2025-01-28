import React, { useState, useEffect, useMemo } from 'react';
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
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Share as ShareIcon,
  Leaderboard as LeaderboardIcon,
  Delete as DeleteIcon,
  Quiz as QuizIcon,
  Group as GroupIcon,
  Timer as TimerIcon,
  Poll as PollIcon,
  BarChart as BarChartIcon
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
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const data = await api.getUserQuizzes();
        setContent(data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch your content');
        console.error('Error fetching content:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  const handleDeleteContent = async (id) => {
    try {
      await api.deleteQuiz(id);
      setContent(content.filter(item => item.id !== id));
    } catch (err) {
      setError('Failed to delete content');
      console.error('Error deleting content:', err);
    }
  };

  const quizzes = useMemo(() => content.filter(item => item.type === 'quiz'), [content]);
  const polls = useMemo(() => content.filter(item => item.type === 'poll'), [content]);

  const currentContent = activeTab === 0 ? quizzes : polls;

  const stats = useMemo(() => {
    const items = currentContent;
    return {
      total: items.length,
      participants: items.reduce((acc, item) => acc + (item.participants || 0), 0),
      avgQuestions: items.length ? 
        Math.round(items.reduce((acc, item) => acc + item.questions.length, 0) / items.length) : 0,
      avgTime: items.length ?
        Math.round(items.reduce((acc, item) => 
          acc + item.questions.reduce((sum, q) => sum + (q.timer || 0), 0), 0) / items.length) : 0
    };
  }, [currentContent]);

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
          My Dashboard
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => setActiveTab(newValue)}
            centered
            sx={{
              '& .MuiTab-root': {
                fontSize: '1.1rem',
                textTransform: 'none',
                minWidth: 120,
              }
            }}
          >
            <Tab 
              icon={<QuizIcon sx={{ mr: 1 }} />} 
              label="My Quizzes" 
              iconPosition="start"
            />
            <Tab 
              icon={<PollIcon sx={{ mr: 1 }} />} 
              label="My Polls" 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={activeTab === 0 ? QuizIcon : PollIcon}
              title={`Total ${activeTab === 0 ? 'Quizzes' : 'Polls'}`}
              value={stats.total}
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={GroupIcon}
              title="Total Participants"
              value={stats.participants}
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={activeTab === 0 ? QuizIcon : BarChartIcon}
              title="Avg. Questions"
              value={stats.avgQuestions}
              delay={400}
            />
          </Grid>
          {activeTab === 0 && (
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                icon={TimerIcon}
                title="Avg. Duration (sec)"
                value={stats.avgTime}
                delay={600}
              />
            </Grid>
          )}
        </Grid>

        <Grid container spacing={4}>
          {currentContent.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
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
                      {item.title}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {item.questions.length} Questions
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created: {new Date(item.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
                    <Box>
                      <Tooltip title={`Share ${activeTab === 0 ? 'Quiz' : 'Poll'}`}>
                        <IconButton
                          onClick={() => navigate(`/quiz/${item.id}/share`)}
                          sx={{ 
                            mr: 1,
                            background: theme.palette.action.hover,
                            '&:hover': { background: theme.palette.action.selected }
                          }}
                        >
                          <ShareIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={activeTab === 0 ? 'View Leaderboard' : 'View Results'}>
                        <IconButton
                          onClick={() => navigate(`/quiz/${item.id}/results`)}
                          sx={{ 
                            background: theme.palette.action.hover,
                            '&:hover': { background: theme.palette.action.selected }
                          }}
                        >
                          {activeTab === 0 ? <LeaderboardIcon /> : <BarChartIcon />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Tooltip title={`Delete ${activeTab === 0 ? 'Quiz' : 'Poll'}`}>
                      <IconButton
                        onClick={() => handleDeleteContent(item.id)}
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

        {currentContent.length === 0 && !error && (
          <Paper sx={{ 
            textAlign: 'center', 
            py: 8,
            px: 4,
            backgroundColor: 'rgba(0,0,0,0.02)',
            borderRadius: 3,
            border: `1px dashed ${theme.palette.divider}`
          }}>
            {activeTab === 0 ? <QuizIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2 }} />
                            : <PollIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2 }} />}
            <Typography variant="h5" color="text.secondary" gutterBottom>
              You haven't created any {activeTab === 0 ? 'quizzes' : 'polls'} yet
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Create your first {activeTab === 0 ? 'quiz' : 'poll'} and start engaging with participants
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
              Create Your First {activeTab === 0 ? 'Quiz' : 'Poll'}
            </Button>
          </Paper>
        )}
      </Box>

      <Tooltip title={`Create New ${activeTab === 0 ? 'Quiz' : 'Poll'}`} placement="left">
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
