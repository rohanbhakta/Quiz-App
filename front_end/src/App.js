import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import LandingPage from './components/LandingPage';
import CreateQuiz from './components/CreateQuiz';
import PlayQuiz from './components/PlayQuiz';
import QuizResults from './components/QuizResults';
import ShareQuiz from './components/ShareQuiz';
import ThemeToggle from './components/ThemeToggle';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import './App.css';

function App() {
  // Initialize theme from localStorage or default to 'light'
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode(prevMode => prevMode === 'light' ? 'dark' : 'light');
  };

  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        backgroundColor: theme.palette.background.default,
        transition: 'background-color 0.3s ease'
      }}>
        <Router>
          <ThemeToggle onToggle={toggleTheme} />
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/create" element={
              <ProtectedRoute>
                <CreateQuiz />
              </ProtectedRoute>
            } />
            <Route path="/quiz/:id" element={<PlayQuiz />} />
            <Route path="/quiz/:id/results" element={<QuizResults />} />
            <Route path="/quiz/:id/share" element={<ShareQuiz />} />
          </Routes>
        </Router>
      </Box>
    </ThemeProvider>
  );
}

export default App;
