import React from 'react';
import { IconButton, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

const ThemeToggle = ({ onToggle }) => {
  const theme = useTheme();
  
  return (
    <IconButton
      onClick={onToggle}
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.1)' 
            : 'rgba(0,0,0,0.05)'
        }
      }}
    >
      {theme.palette.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
};

export default ThemeToggle;
