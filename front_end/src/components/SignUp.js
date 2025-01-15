import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  Link,
  CircularProgress,
  useTheme
} from '@mui/material';
import { api } from '../services/api';

const SignUp = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Log sign-up attempt in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sign-up attempt:', {
        email,
        username,
        timestamp: new Date().toISOString()
      });
    }

    // Validate input
    if (!email.trim() || !username.trim() || !password.trim()) {
      setError('All fields are required');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }

    setLoading(true);

    try {
      // Attempt sign up
      const response = await api.signUp(email.trim(), username.trim(), password);
      const { token, username: savedUsername } = response;

      // Log successful sign-up
      console.log('Sign-up successful:', {
        username: savedUsername,
        timestamp: new Date().toISOString()
      });

      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('username', savedUsername);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      // Enhanced error logging
      console.error('Sign-up error:', {
        error: err.message,
        response: err.response?.data,
        status: err.response?.status,
        timestamp: new Date().toISOString()
      });

      // Set user-friendly error message
      if (err.response?.status === 400) {
        if (err.response.data?.message?.includes('email')) {
          setError('This email is already registered');
        } else if (err.response.data?.message?.includes('username')) {
          setError('This username is already taken');
        } else {
          setError(err.response.data?.message);
        }
      } else if (!navigator.onLine) {
        setError('Please check your internet connection');
      } else {
        setError(err.response?.data?.message || 'Failed to sign up. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box
            component="img"
            src="/logo.svg"
            alt="QuizApp"
            onClick={() => navigate('/')}
            sx={{
              height: 48,
              mb: 3,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
          <Typography 
            variant="h2" 
            gutterBottom
            sx={{
              background: theme.palette.gradient.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center'
            }}
          >
            Sign Up
          </Typography>
        </Box>

        <Paper 
          sx={{ 
            p: 4,
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            background: theme.palette.gradient.background,
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={(e) => setUsername(e.target.value.trim())}
              margin="normal"
              required
              disabled={loading}
              error={!!error && error.toLowerCase().includes('username')}
              helperText={
                error && error.toLowerCase().includes('username')
                  ? error
                  : 'Username must be at least 3 characters long'
              }
              InputProps={{
                'aria-label': 'Username'
              }}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={(e) => setEmail(e.target.value.trim())}
              margin="normal"
              required
              disabled={loading}
              error={!!error && error.toLowerCase().includes('email')}
              helperText={error && error.toLowerCase().includes('email') ? error : ''}
              InputProps={{
                'aria-label': 'Email'
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              helperText="Password must be at least 6 characters long"
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              error={password !== confirmPassword && confirmPassword !== ''}
              helperText={
                password !== confirmPassword && confirmPassword !== ''
                  ? 'Passwords do not match'
                  : ''
              }
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ 
                mt: 3,
                mb: 2,
                py: 1.5,
                background: theme.palette.gradient.primary,
                '&:hover': {
                  background: theme.palette.gradient.hover,
                },
                '&.Mui-disabled': {
                  background: theme.palette.action.disabledBackground,
                }
              }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: 'white' }} />
                  <span>Creating Account...</span>
                </Box>
              ) : (
                'Sign Up'
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/signin')}
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignUp;
