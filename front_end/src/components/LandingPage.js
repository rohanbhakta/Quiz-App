import React, { useState, useEffect } from 'react';
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
  CardContent,
  keyframes
} from '@mui/material';
import {
  Add as AddIcon,
  PlayArrow as PlayIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  Group as GroupIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

// Define swing animation
const swing = keyframes`
  0% { transform: rotate(-5deg); }
  50% { transform: rotate(3deg); }
  100% { transform: rotate(-5deg); }
`;

// Define fade in animation
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

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
  const [scrollPosition, setScrollPosition] = useState(0);
  const [selectedOption, setSelectedOption] = useState(-1);

  useEffect(() => {
    const handleScroll = () => {
      const position = window.pageYOffset;
      setScrollPosition(position);
      
      // Calculate when to show the correct answer
      const heroSection = document.getElementById('hero-section');
      if (heroSection) {
        const sectionHeight = heroSection.offsetHeight;
        const scrollPercentage = (position / sectionHeight) * 100;
        
        if (scrollPercentage > 30) {
          setSelectedOption(1); // Index of correct answer (Paris)
        } else {
          setSelectedOption(-1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        id="hero-section"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          pt: { xs: 10, md: 16 },
          pb: { xs: 8, md: 12 },
          minHeight: '100vh',
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
            <Grid item xs={12} md={7} sx={{
              transform: `translateY(${scrollPosition * 0.3}px)`,
              opacity: Math.max(0, 1 - scrollPosition / 500),
              transition: 'transform 0.1s ease-out'
            }}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box
                    component="img"
                    src="/logo.svg"
                    alt="QuizApp"
                    sx={{
                      height: { xs: 60, sm: 80, md: 100 },
                      mr: 3,
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }}
                  />
                  <Typography 
                    variant="h1" 
                    sx={{
                      fontSize: { xs: '3rem', sm: '4rem', md: '5rem' },
                      fontWeight: 800,
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      lineHeight: 1.1
                    }}
                  >
                    QuizApp
                  </Typography>
                </Box>
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
                transform: `translateY(${scrollPosition * -0.2}px)`,
                transition: 'transform 0.1s ease-out',
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
                {/* Nail Image */}
                <Box
                  component="img"
                  src="/nail.svg"
                  alt="Nail"
                  sx={{
                    position: 'absolute',
                    top: -15,
                    left: 20,
                    width: 30,
                    height: 30,
                    zIndex: 2,
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
                    transform: 'rotate(5deg)'
                  }}
                />
                {/* Sample Question Card */}
                <Paper sx={{ 
                  p: 4,
                  borderRadius: 4,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  transformOrigin: '20px 0',
                  animation: `${swing} 6s ease-in-out infinite`,
                  '&:hover': {
                    animationPlayState: 'paused',
                  },
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 20,
                    width: 2,
                    height: 15,
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'rotate(5deg)',
                    transformOrigin: 'top',
                    boxShadow: '0 0 8px rgba(255,255,255,0.3)'
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
                      variant={i === selectedOption ? 'contained' : 'outlined'}
                      fullWidth
                      sx={{ 
                        mb: 1,
                        color: i === selectedOption ? theme.palette.primary.main : 'white',
                        borderColor: 'rgba(255,255,255,0.5)',
                        backgroundColor: i === selectedOption ? 'white' : 'transparent',
                        transition: 'all 0.3s ease',
                        animation: i === selectedOption ? `${fadeIn} 0.5s ease forwards` : 'none',
                        '&:hover': {
                          backgroundColor: i === selectedOption ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.1)',
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
