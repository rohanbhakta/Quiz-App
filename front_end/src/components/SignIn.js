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
  useTheme,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon
} from '@mui/icons-material';
import { api } from '../services/api';

const SignIn = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!emailOrUsername.trim() || !password.trim()) {
        setError('Please enter both email/username and password');
        setLoading(false);
        return;
      }

      const response = await api.signIn(emailOrUsername.trim(), password);
      const { token, username } = response;

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', token);
      storage.setItem('username', username);

      navigate('/dashboard');
    } catch (err) {
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
            Welcome Back
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: theme.palette.text.secondary,
              mb: 4
            }}
          >
            Sign in to continue to QuizApp
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
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={(e) => setPassword(e.target.value.trim())}
              margin="normal"
              required
              disabled={loading}
              error={!!error && error.toLowerCase().includes('password')}
              helperText={error && error.toLowerCase().includes('password') ? error : ''}
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

            <Box sx={{ 
              mt: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
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
              />
              <Link
                component="button"
                variant="body2"
                onClick={() => {/* Handle forgot password */}}
                sx={{
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Forgot password?
              </Link>
            </Box>

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
                  <span>Signing In...</span>
                </Box>
              ) : (
                'Sign In'
              )}
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>

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
                    fontWeight: 600,
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
