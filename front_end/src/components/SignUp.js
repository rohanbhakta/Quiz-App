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
  useTheme,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon,
  Email as EmailIcon
} from '@mui/icons-material';
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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

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
      const response = await api.signUp(email.trim(), username.trim(), password);
      const { token, username: savedUsername } = response;

      localStorage.setItem('token', token);
      localStorage.setItem('username', savedUsername);

      navigate('/dashboard');
    } catch (err) {
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
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        py: 8
      }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Box
            component="img"
            src="/logo.svg"
            alt="QuizApp"
            onClick={() => navigate('/')}
            sx={{
              height: 60,
              mb: 3,
              cursor: 'pointer',
              transition: 'transform 0.2s',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}
          />
          <Typography 
            variant="h3" 
            gutterBottom
            sx={{
              fontWeight: 700,
              background: theme.palette.gradient.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              mb: 1
            }}
          >
            Create Account
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: theme.palette.text.secondary,
              mb: 4
            }}
          >
            Join QuizApp to create and share quizzes
          </Typography>
        </Box>

        <Paper 
          elevation={8}
          sx={{ 
            p: 4,
            borderRadius: 3,
            background: theme.palette.gradient.background,
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: 2,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
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
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
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
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              disabled={loading}
              helperText="Password must be at least 6 characters long"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ 
                mt: 4,
                mb: 2,
                py: 1.5,
                borderRadius: 2,
                fontSize: '1rem',
                textTransform: 'none',
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
                'Create Account'
              )}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

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
                    fontWeight: 600,
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
