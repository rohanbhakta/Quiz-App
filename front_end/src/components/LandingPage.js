import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Grid,
  useTheme,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  Group as GroupIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

const FeatureCard = ({ icon: Icon, title, description }) => {
  const theme = useTheme();
  return (
    <Card sx={{
      height: '100%',
      background: theme.palette.gradient.background,
      borderRadius: 3,
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
      }
    }}>
      <CardContent sx={{ p: 4, textAlign: 'center' }}>
        <Icon sx={{ 
          fontSize: 48, 
          mb: 2,
          color: theme.palette.primary.main
        }} />
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

const LandingPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{
        position: 'relative',
        overflow: 'hidden',
        pt: { xs: 10, md: 16 },
        pb: { xs: 8, md: 12 },
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.light} 100%)`,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 150%, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 50%)',
        }
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Typography 
                  variant="h1" 
                  sx={{
                    fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                    fontWeight: 800,
                    color: 'white',
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    mb: 2,
                    lineHeight: 1.1
                  }}
                >
                  Piramal quiz-ine
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{
                    color: 'rgba(255,255,255,0.9)',
                    mb: 4,
                    fontWeight: 300,
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  Create engaging quizzes and challenge your knowledge
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' }
                }}>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/signin')}
                      sx={{ 
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        backgroundColor: 'white',
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.9)',
                        }
                      }}
                    >
                      Sign In to Create
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<PlayIcon />}
                      onClick={() => navigate('/signup')}
                      sx={{ 
                        py: 2,
                        px: 4,
                        fontSize: '1.1rem',
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'rgba(255,255,255,0.9)',
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Sign Up
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ 
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '120%',
                  height: '120%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                  borderRadius: '50%'
                }
              }}>
                <Paper sx={{ 
                  p: 4,
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  transform: 'rotate(-5deg)',
                  transition: 'transform 0.3s ease',
                  '&:hover': {
                    transform: 'rotate(-3deg) translateY(-8px)',
                  }
                }}>
                  <Typography variant="h5" sx={{ color: 'white', mb: 2 }}>
                    Sample Question
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.9)', mb: 3 }}>
                    What is the capital of France?
                  </Typography>
                  {['London', 'Paris', 'Berlin', 'Madrid'].map((option, i) => (
                    <Button
                      key={i}
                      variant={i === 1 ? 'contained' : 'outlined'}
                      fullWidth
                      sx={{ 
                        mb: 1,
                        color: i === 1 ? theme.palette.primary.main : 'white',
                        borderColor: 'rgba(255,255,255,0.5)',
                        backgroundColor: i === 1 ? 'white' : 'transparent',
                        '&:hover': {
                          backgroundColor: i === 1 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)',
                          borderColor: 'white'
                        }
                      }}
                    >
                      {option}
                    </Button>
                  ))}
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          align="center" 
          sx={{
            mb: 6,
            background: theme.palette.gradient.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }}
        >
          Features
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard
              icon={TimerIcon}
              title="Timed Questions"
              description="Set custom time limits for each question to keep participants engaged and challenged"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard
              icon={TrophyIcon}
              title="Real-time Scoring"
              description="Instant scoring with combined metrics for both accuracy and speed"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard
              icon={GroupIcon}
              title="Multiplayer"
              description="Host interactive quizzes with multiple participants competing in real-time"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FeatureCard
              icon={AnalyticsIcon}
              title="Detailed Analytics"
              description="Track performance with comprehensive statistics and leaderboards"
            />
          </Grid>
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box sx={{ 
        py: 8, 
        background: theme.palette.gradient.background,
        borderTop: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h4" 
              gutterBottom
              sx={{ fontWeight: 600 }}
            >
              Ready to create your quiz?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4,
                color: theme.palette.text.secondary
              }}
            >
              Start engaging your audience with interactive quizzes
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/create')}
              sx={{ 
                py: 2,
                px: 6,
                background: theme.palette.gradient.primary,
                '&:hover': {
                  background: theme.palette.gradient.hover,
                }
              }}
            >
              Sign In to Create Quiz
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
