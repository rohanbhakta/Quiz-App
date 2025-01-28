import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Snackbar,
  useTheme,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Share as ShareIcon,
  EmojiEvents as TrophyIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';

const ShareQuiz = () => {
  const theme = useTheme();
  const { id } = useParams();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate the quiz URL
  const quizUrl = `${window.location.origin}/quiz/${id}`;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await api.getResults(id);
        setResults(data);
        setError(null);
      } catch (err) {
        setError('Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 1) {
      fetchResults();
    }
  }, [id, activeTab]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(quizUrl);
      setCopied(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Join my Quiz!',
          text: 'Click the link to join my interactive quiz!',
          url: quizUrl
        });
      } else {
        handleCopy();
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const getAvatarUrl = (config) => {
    if (!config) return '';
    
    const params = {
      seed: config.seed || Math.random().toString(36).substring(7),
      backgroundColor: (config.backgroundColor || '#FFFFFF').replace('#', ''),
      accessoriesType: config.accessories?.length ? config.accessories[0] : 'blank',
      clothingType: config.clothing || 'blazerShirt',
      eyebrowType: config.eyebrows || 'default',
      eyeType: config.eyes || 'default',
      facialHairType: config.facialHair || 'blank',
      hairColor: (config.hairColor || '#000000').replace('#', ''),
      mouthType: config.mouth || 'default',
      skinColor: (config.skinColor || '#F8D5C2').replace('#', ''),
      topType: config.hairStyle || 'shortHairShortFlat',
      clothingColor: (config.clothingColor || '#3498DB').replace('#', '')
    };

    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');

    return `https://api.dicebear.com/7.x/avataaars/svg?${queryString}`;
  };

  const renderLeaderboard = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>
      );
    }

    if (!results || results.length === 0) {
      return (
        <Typography 
          variant="body1" 
          sx={{ textAlign: 'center', mt: 4, color: theme.palette.text.secondary }}
        >
          No participants yet
        </Typography>
      );
    }

    return (
      <List sx={{ width: '100%', mt: 2 }}>
        {results.map((result, index) => (
          <Paper
            key={result.player?.id || index}
            sx={{ 
              mb: 2,
              backgroundColor: theme.palette.background.paper,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.02)',
              }
            }}
          >
            <ListItem
              secondaryAction={
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" color="primary">
                    {result.score}/{result.totalQuestions}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TimerIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {result.timeEfficiency}
                    </Typography>
                  </Box>
                </Box>
              }
            >
              <ListItemAvatar>
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={getAvatarUrl(result.player?.avatar)}
                    sx={{ width: 48, height: 48 }}
                  />
                  {index < 3 && (
                    <TrophyIcon 
                      sx={{ 
                        position: 'absolute',
                        top: -10,
                        right: -10,
                        color: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'
                      }} 
                    />
                  )}
                </Box>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="h6">
                    {result.player?.name || 'Anonymous'}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" color="text.secondary">
                    Average response time: {(result.averageResponseTime / 1000).toFixed(1)}s
                  </Typography>
                }
              />
            </ListItem>
          </Paper>
        ))}
      </List>
    );
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 8 }}>
        <Typography 
          variant="h2" 
          gutterBottom
          sx={{
            background: theme.palette.gradient.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textAlign: 'center',
            mb: 6
          }}
        >
          Share Quiz
        </Typography>

        <Paper 
          sx={{ 
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            background: theme.palette.gradient.background,
            overflow: 'hidden'
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              backgroundColor: theme.palette.background.paper
            }}
          >
            <Tab label="Share" />
            <Tab label="Leaderboard" />
          </Tabs>

          <Box sx={{ p: 4 }}>
            {activeTab === 0 ? (
              <>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ color: theme.palette.text.primary }}
                >
                  Share this link with participants:
                </Typography>

                <Box sx={{ 
                  display: 'flex', 
                  gap: 2,
                  mt: 3,
                  mb: 4
                }}>
                  <TextField
                    fullWidth
                    value={quizUrl}
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                      sx: {
                        backgroundColor: theme.palette.background.paper,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover
                        }
                      }
                    }}
                  />
                  <IconButton 
                    onClick={handleCopy}
                    sx={{
                      backgroundColor: theme.palette.background.paper,
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover
                      }
                    }}
                  >
                    <CopyIcon />
                  </IconButton>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<ShareIcon />}
                  onClick={handleShare}
                  sx={{ 
                    py: 1.5,
                    background: theme.palette.gradient.primary,
                    '&:hover': {
                      background: theme.palette.gradient.hover,
                    }
                  }}
                >
                  Share Quiz
                </Button>

                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 3,
                    color: theme.palette.text.secondary,
                    textAlign: 'center'
                  }}
                >
                  Participants can use this link to join the quiz and compete in real-time
                </Typography>
              </>
            ) : (
              renderLeaderboard()
            )}
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message="Link copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default ShareQuiz;
