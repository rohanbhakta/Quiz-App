import React, { useState, useEffect, useRef, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
  Alert,
  Stack,
  Divider
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
  const [duration, setDuration] = useState('');
  const [expirationTime, setExpirationTime] = useState(null);
  const [settingExpiration, setSettingExpiration] = useState(false);
  const [quiz, setQuiz] = useState(null);

  // Generate the quiz URL
  const quizUrl = `${window.location.origin}/quiz/${id}`;

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await api.getQuiz(id);
        setQuiz(data);
      } catch (err) {
        setError('Failed to load quiz details.');
      }
    };
    fetchQuiz();
  }, [id]);

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
          title: `Join my ${quiz?.type === 'poll' ? 'Poll' : 'Quiz'}!`,
          text: `Click the link to join my interactive ${quiz?.type === 'poll' ? 'poll' : 'quiz'}!`,
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

  // Process poll results to get answer distribution
  const pollResults = useMemo(() => {
    if (!quiz || !results || quiz.type !== 'poll') return null;

    const answerCounts = {};
    let totalResponses = 0;

    results.forEach(result => {
      if (result.answers && result.answers.length > 0) {
        const answer = result.answers[0]; // For polls, we only have one answer
        const selectedOption = answer.selectedOption;
        answerCounts[selectedOption] = (answerCounts[selectedOption] || 0) + 1;
        totalResponses++;
      }
    });

    return quiz.questions[0].options.map((option, index) => ({
      option,
      count: answerCounts[index] || 0,
      percentage: totalResponses ? ((answerCounts[index] || 0) / totalResponses * 100).toFixed(1) : 0
    }));
  }, [quiz, results]);

  const renderPollResults = () => {
    if (!pollResults) return null;

    const maxCount = Math.max(...pollResults.map(r => r.count));

    return (
      <Stack spacing={3} sx={{ width: '100%', mt: 3 }}>
        {pollResults.map((result, index) => (
          <Box key={index}>
            <Box sx={{ mb: 1 }}>
              <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                {result.option}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {result.count} {result.count === 1 ? 'response' : 'responses'} ({result.percentage}%)
              </Typography>
            </Box>
            <Box
              sx={{
                height: 24,
                width: '100%',
                backgroundColor: 'action.hover',
                borderRadius: 1,
                overflow: 'hidden'
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${result.percentage}%`,
                  background: theme.palette.gradient.primary,
                  transition: 'width 1s ease-in-out',
                }}
              />
            </Box>
          </Box>
        ))}
        <Divider sx={{ my: 2 }} />
        <Typography variant="body2" color="text.secondary" textAlign="center">
          Total Responses: {results.length}
        </Typography>
      </Stack>
    );
  };

  const renderQuizLeaderboard = () => {
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

  const renderResults = () => {
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

    return quiz?.type === 'poll' ? renderPollResults() : renderQuizLeaderboard();
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
          Share {quiz?.type === 'poll' ? 'Poll' : 'Quiz'}
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
            <Tab label={quiz?.type === 'poll' ? 'Results' : 'Leaderboard'} />
          </Tabs>

          <Box sx={{ p: 4 }}>
            {activeTab === 0 ? (
              <>
                <Box sx={{ mb: 4 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ color: theme.palette.text.primary }}
                  >
                    Set {quiz?.type === 'poll' ? 'Poll' : 'Quiz'} Duration
                  </Typography>
                  <Box sx={{ 
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    mb: 3
                  }}>
                    <TextField
                      type="number"
                      label="Duration (minutes)"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      variant="outlined"
                      size="small"
                      disabled={settingExpiration || expirationTime}
                      sx={{ width: 200 }}
                      InputProps={{
                        inputProps: { min: 1 }
                      }}
                    />
                    <Button
                      variant="contained"
                      onClick={async () => {
                        try {
                          setSettingExpiration(true);
                          const response = await api.setQuizExpiration(id, parseInt(duration));
                          setExpirationTime(new Date(response.expirationTime));
                          setCopied(false);
                        } catch (err) {
                          setError(err.message);
                        } finally {
                          setSettingExpiration(false);
                        }
                      }}
                      disabled={!duration || settingExpiration || expirationTime}
                      sx={{ 
                        py: 1,
                        background: theme.palette.gradient.primary,
                        '&:hover': {
                          background: theme.palette.gradient.hover,
                        }
                      }}
                    >
                      {settingExpiration ? 'Setting...' : 'Set Duration'}
                    </Button>
                  </Box>
                  {expirationTime && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      {quiz?.type === 'poll' ? 'Poll' : 'Quiz'} will expire at: {new Date(expirationTime).toLocaleString()}
                    </Alert>
                  )}
                </Box>

                <Box sx={{ 
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 4,
                  alignItems: 'center',
                  mb: 4
                }}>
                  {/* QR Code Section */}
                  <Box sx={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ color: theme.palette.text.primary }}
                    >
                      Scan QR Code
                    </Typography>
                    <Paper sx={{ 
                      p: 3,
                      backgroundColor: 'white',
                      borderRadius: 2,
                      boxShadow: theme.shadows[2]
                    }}>
                      <QRCodeSVG 
                        value={quizUrl}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </Paper>
                  </Box>

                  {/* URL Section */}
                  <Box sx={{ flex: 2 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ color: theme.palette.text.primary }}
                    >
                      Share this link:
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
                      Share {quiz?.type === 'poll' ? 'Poll' : 'Quiz'}
                    </Button>

                    <Typography 
                      variant="body2" 
                      sx={{ 
                        mt: 3,
                        color: theme.palette.text.secondary,
                        textAlign: 'center'
                      }}
                    >
                      {expirationTime 
                        ? `${quiz?.type === 'poll' ? 'Poll' : 'Quiz'} will be accessible until ${new Date(expirationTime).toLocaleString()}`
                        : `Set a duration to limit ${quiz?.type === 'poll' ? 'poll' : 'quiz'} access time`}
                    </Typography>
                  </Box>
                </Box>
              </>
            ) : (
              renderResults()
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
