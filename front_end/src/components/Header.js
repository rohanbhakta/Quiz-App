import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  useTheme
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const Header = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on home page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <Box sx={{ 
      position: 'fixed',
      top: 16,
      left: 16,
      zIndex: 1000
    }}>
      <Button
        variant="contained"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/')}
        sx={{
          background: theme.palette.gradient.primary,
          '&:hover': {
            background: theme.palette.gradient.hover,
          },
          boxShadow: theme.shadows[4]
        }}
      >
        Home
      </Button>
    </Box>
  );
};

export default Header;
