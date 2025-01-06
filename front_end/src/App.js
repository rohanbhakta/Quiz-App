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
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
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
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Quiz App
            </Typography>
            <Button color="inherit" component={Link} to="/">
              Home
            </Button>
            <Button color="inherit" component={Link} to="/create">
              Create Quiz
            </Button>
          </Toolbar>
        </AppBar>

        <Container>
          <Routes>
            <Route path="/" element={
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom>
                  Welcome to Quiz App
                </Typography>
                <Typography variant="body1" paragraph>
                  Create and share interactive quizzes with your friends!
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/create"
                  size="large"
                  sx={{ mt: 2 }}
                >
                  Create New Quiz
                </Button>
              </Box>
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
