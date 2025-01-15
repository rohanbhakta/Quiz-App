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
  FormControlLabel,
  Checkbox,
  useTheme
} from '@mui/material';
import { api } from '../services/api';

const SignIn = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Log sign-in attempt in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Sign-in attempt:', {
        emailOrUsername,
        timestamp: new Date().toISOString()
      });
    }

    try {
      // Validate input
      if (!emailOrUsername.trim() || !password.trim()) {
        setError('Please enter both email/username and password');
        setLoading(false);
        return;
      }

      // Attempt sign in
      const response = await api.signIn(emailOrUsername.trim(), password);
      const { token, username } = response;

      // Log successful sign-in
      console.log('Sign-in successful:', {
        username,
        timestamp: new Date().toISOString()
      });

      // Store auth data
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', token);
      storage.setItem('username', username);

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      // Enhanced error logging
      console.error('Sign-in error:', {
        error: err.message,
        response: err.response?.data,
        status: err.response?.status,
        timestamp: new Date().toISOString()
      });

      // Set user-friendly error message
      if (err.response?.status === 401) {
        setError('Invalid email/username or password');
      } else if (err.response?.status === 404) {
        setError('Account not found');
      } else if (!navigator.onLine) {
        setError('Please check your internet connection');
      } else {
        setError(err.response?.data?.message || 'Failed to sign in. Please try again.');
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
            Sign In
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
              label="Email or Username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              onBlur={(e) => setEmailOrUsername(e.target.value.trim())}
              margin="normal"
              required
              disabled={loading}
              error={!!error && error.toLowerCase().includes('email')}
              helperText={error && error.toLowerCase().includes('email') ? error : ''}
              InputProps={{
                'aria-label': 'Email or Username'
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={(e) => setPassword(e.target.value.trim())}
              margin="normal"
              required
              disabled={loading}
              error={!!error && error.toLowerCase().includes('password')}
              helperText={error && error.toLowerCase().includes('password') ? error : ''}
              InputProps={{
                'aria-label': 'Password'
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  color="primary"
                  disabled={loading}
                />
              }
              label="Remember me"
              sx={{ mt: 2 }}
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
                  <span>Signing In...</span>
                </Box>
              ) : (
                'Sign In'
              )}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Don't have an account?{' '}
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/signup')}
                  sx={{
                    color: theme.palette.primary.main,
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignIn;
