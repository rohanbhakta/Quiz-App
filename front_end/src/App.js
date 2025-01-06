import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material';
import CreateQuiz from './components/CreateQuiz';
import PlayQuiz from './components/PlayQuiz';
import QuizResults from './components/QuizResults';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00338D', // Piramal primary blue
      light: '#1976D2',
      dark: '#002266',
    },
    secondary: {
      main: '#00A0DC', // Piramal secondary blue
      light: '#33B4E4',
      dark: '#007AA6',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2.75rem',
    },
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,51,141,0.15)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
          boxShadow: '0 4px 12px rgba(0,51,141,0.1)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar position="static">
          <Toolbar>
            <Box 
              sx={{ 
                flexGrow: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'flex-start' }
              }}
            >
              <Box 
                sx={{ 
                  animation: 'fadeIn 0.8s ease-out',
                  '&:hover': {
                    '& .logo-text': {
                      backgroundSize: '200% auto',
                      animation: 'gradientFlow 3s linear infinite',
                    },
                    '& .tagline': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    }
                  }
                }}
              >
                <Typography 
                  className="logo-text"
                  variant="h4" 
                  component="div" 
                  sx={{ 
                    fontWeight: 800,
                    background: 'linear-gradient(90deg, #FFFFFF 30%, #E0F7FF 50%, #FFFFFF 70%)',
                    backgroundSize: '100% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 10px rgba(255,255,255,0.2)',
                    letterSpacing: '1px',
                    transition: 'all 0.3s ease',
                    '& span': {
                      color: '#E0F7FF',
                      WebkitTextFillColor: '#E0F7FF',
                      textShadow: '0 0 10px rgba(224,247,255,0.5)',
                    }
                  }}
                >
                  Piramal <span>QUIZ</span>-ine
                </Typography>
                <Typography 
                  className="tagline"
                  variant="subtitle2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.95)',
                    fontStyle: 'italic',
                    mt: -0.5,
                    opacity: 0.9,
                    transform: 'translateY(2px)',
                    transition: 'all 0.3s ease',
                    textShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    letterSpacing: '0.5px'
                  }}
                >
                  Where Knowledge is the Secret Ingredient!
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                component={Link} 
                to="/"
                sx={{ 
                  color: 'white',
                  borderRadius: '20px',
                  px: 2,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.1)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Home
              </Button>
              <Button 
                component={Link} 
                to="/create"
                sx={{ 
                  color: 'white',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  px: 2,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.2)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Create Quiz
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          <Routes>
            <Route path="/" element={
              <>
                {/* Hero Section */}
                <Box
                  sx={{
                    mt: 8,
                    mb: 12,
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' } }}>
                    <Typography
                      variant="h1"
                      sx={{
                        background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 3,
                      }}
                    >
                      Master Knowledge Through Interactive Quizzes
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                      Create engaging quizzes, challenge your friends, and track your progress with our intuitive quiz platform.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'center', md: 'flex-start' } }}>
                      <Button
                        variant="contained"
                        color="primary"
                        component={Link}
                        to="/create"
                        size="large"
                        sx={{
                          fontSize: '1.1rem',
                          py: 1.5,
                          px: 4,
                          background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
                          '&:hover': {
                            background: 'linear-gradient(90deg, #002266 0%, #007AA6 100%)',
                          },
                        }}
                      >
                        Create Quiz
                      </Button>
                      <Button
                        variant="outlined"
                        color="primary"
                        component={Link}
                        to="/quiz/latest"
                        size="large"
                        sx={{ fontSize: '1.1rem', py: 1.5, px: 4 }}
                      >
                        Try Demo Quiz
                      </Button>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      flex: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        maxWidth: 600,
                        height: 400,
                        background: 'linear-gradient(135deg, rgba(0,51,141,0.08) 0%, rgba(0,160,220,0.08) 100%)',
                        borderRadius: '30px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        animation: 'fadeIn 0.8s ease-out',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -20,
                          left: -20,
                          right: 20,
                          bottom: 20,
                          background: 'linear-gradient(135deg, rgba(0,51,141,0.05) 0%, rgba(0,160,220,0.05) 100%)',
                          borderRadius: '30px',
                          zIndex: -1,
                        },
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 70%)',
                          opacity: 0,
                          transition: 'opacity 0.3s ease',
                        },
                        '&:hover': {
                          '&::after': {
                            opacity: 1,
                          },
                          '& .platform-text': {
                            transform: 'translateY(-10px)',
                          },
                          '& .platform-subtext': {
                            opacity: 1,
                            transform: 'translateY(0)',
                          }
                        }
                      }}
                    >
                      <Typography 
                        className="platform-text"
                        variant="h3" 
                        sx={{ 
                          color: 'primary.main',
                          fontWeight: 600,
                          textAlign: 'center',
                          transition: 'transform 0.3s ease',
                          mb: 2
                        }}
                      >
                        🎯 Quiz Time!
                      </Typography>
                      <Typography 
                        className="platform-subtext"
                        variant="h6" 
                        sx={{ 
                          color: 'primary.main',
                          opacity: 0.7,
                          transform: 'translateY(10px)',
                          transition: 'all 0.3s ease',
                          textAlign: 'center',
                          maxWidth: '80%'
                        }}
                      >
                        Serve up knowledge with a side of fun
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Features Section */}
                <Box 
                  sx={{ 
                    mb: 12,
                    position: 'relative',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '100vw',
                      height: '100%',
                      transform: 'translate(-50%, -50%)',
                      background: 'linear-gradient(135deg, rgba(0,51,141,0.03) 0%, rgba(0,160,220,0.03) 100%)',
                      zIndex: -1,
                    }
                  }}
                >
                  <Typography 
                    variant="h2" 
                    textAlign="center" 
                    sx={{ 
                      mb: 2,
                      background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 700
                    }}
                  >
                    Why Choose Our Platform?
                  </Typography>
                  <Typography 
                    variant="h6" 
                    textAlign="center" 
                    color="text.secondary"
                    sx={{ mb: 8 }}
                  >
                    A recipe for success in every quiz
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                      gap: 4,
                    }}
                  >
                    {[
                      {
                        title: '👨‍🍳 Easy to Create',
                        description: 'Whip up professional quizzes in minutes with our intuitive recipe builder.',
                      },
                      {
                        title: '⚡ Real-time Results',
                        description: 'Watch your quiz scores cook up instantly with live feedback and analytics.',
                      },
                      {
                        title: '🌐 Share & Serve',
                        description: 'Dish out your quizzes anywhere with a simple link or QR code.',
                      },
                    ].map((feature, index) => (
                      <Box
                        key={index}
                        sx={{
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 100%)',
                          p: 4,
                          borderRadius: '24px',
                          boxShadow: '0 4px 24px rgba(0,51,141,0.08)',
                          transition: 'all 0.3s ease',
                          border: '1px solid rgba(0,51,141,0.05)',
                          '&:hover': {
                            transform: 'translateY(-4px) scale(1.02)',
                            boxShadow: '0 8px 32px rgba(0,51,141,0.12)',
                            border: '1px solid rgba(0,51,141,0.1)',
                          },
                        }}
                      >
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            mb: 2, 
                            background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </>
            } />
            <Route path="/create" element={<CreateQuiz />} />
            <Route path="/quiz/:id" element={<PlayQuiz />} />
            <Route path="/quiz/:id/results" element={<QuizResults />} />
          </Routes>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
