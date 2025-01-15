import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  useTheme
} from '@mui/material';
import {
  Home as HomeIcon,
  AccountCircle as AccountIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  Delete as DeleteIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon
} from '@mui/icons-material';
import { api } from '../services/api';

const Header = ({ onToggleTheme }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const isLoggedIn = localStorage.getItem('token') || sessionStorage.getItem('token');
  const username = localStorage.getItem('username') || sessionStorage.getItem('username');

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('username');
    navigate('/');
    handleClose();
  };

  const handleDeleteAccount = async () => {
    try {
      await api.deleteAccount();
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('username');
      navigate('/');
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
    setDeleteDialogOpen(false);
    handleClose();
  };

  const renderContent = () => {
    if (location.pathname === '/') {
      return null;
    }

    return (
      <Box sx={{ 
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
        backgroundColor: theme.palette.background.default,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backdropFilter: 'blur(8px)',
        background: theme.palette.mode === 'light' 
          ? 'rgba(255, 255, 255, 0.9)'
          : 'rgba(18, 18, 18, 0.9)',
        [theme.breakpoints.down('sm')]: {
          padding: '12px'
        }
      }}>
        <Box
          component="img"
          src="/logo.svg"
          alt="QuizApp"
          onClick={() => navigate('/')}
          sx={{
            height: 32,
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.05)'
            }
          }}
        />

        {isLoggedIn && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography 
                variant="subtitle1"
                sx={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 500,
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}
              >
                Welcome, {username}!
              </Typography>
              <IconButton
                onClick={handleMenu}
                sx={{
                  background: theme.palette.gradient.primary,
                  '&:hover': {
                    background: theme.palette.gradient.hover,
                  },
                  boxShadow: theme.shadows[4]
                }}
              >
                <Avatar sx={{ bgcolor: 'transparent' }}>
                  <AccountIcon />
                </Avatar>
              </IconButton>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => { navigate('/dashboard'); handleClose(); }}>
                <ListItemIcon>
                  <DashboardIcon fontSize="small" />
                </ListItemIcon>
                Dashboard
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { onToggleTheme(); handleClose(); }}>
                <ListItemIcon>
                  {theme.palette.mode === 'light' ? (
                    <DarkModeIcon fontSize="small" />
                  ) : (
                    <LightModeIcon fontSize="small" />
                  )}
                </ListItemIcon>
                {theme.palette.mode === 'light' ? 'Dark Mode' : 'Light Mode'}
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
              <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'error.main' }}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                Delete Account
              </MenuItem>
            </Menu>

            <Dialog
              open={deleteDialogOpen}
              onClose={() => setDeleteDialogOpen(false)}
            >
              <DialogTitle>Delete Account?</DialogTitle>
              <DialogContent>
                <Typography>
                  Are you sure you want to delete your account? This action cannot be undone.
                  All your quizzes and data will be permanently deleted.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleDeleteAccount} color="error" variant="contained">
                  Delete Account
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Box>
    );
  };

  return renderContent();
};

export default Header;
