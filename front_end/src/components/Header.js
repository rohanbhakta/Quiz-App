import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  useTheme
} from '@mui/material';
import {
  Brightness4 as DarkIcon,
  Brightness7 as LightIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

const Header = ({ darkMode, onThemeToggle }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isLoggedIn = localStorage.getItem('token') || sessionStorage.getItem('token');
  const isAuthPage = location.pathname === '/signin' || location.pathname === '/signup';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    navigate('/signin');
  };

  if (isLandingPage) {
    return null;
  }

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: theme.palette.gradient.primary,
        boxShadow: theme.shadows[4]
      }}
    >
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            cursor: 'pointer'
          }}
          onClick={() => navigate(isLoggedIn ? '/dashboard' : '/')}
        >
          Quiz App
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={onThemeToggle} 
            color="inherit"
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            {darkMode ? <LightIcon /> : <DarkIcon />}
          </IconButton>
          {isLoggedIn && !isAuthPage && (
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                }
              }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
