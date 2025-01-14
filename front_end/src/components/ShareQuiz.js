import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  IconButton,
  Snackbar,
  useTheme
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';

const ShareQuiz = () => {
  const theme = useTheme();
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  // Generate the quiz URL
  const quizUrl = `${window.location.origin}/quiz/${id}`;

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
            p: 4,
            borderRadius: 2,
            boxShadow: theme.shadows[4],
            background: theme.palette.gradient.background,
          }}
        >
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
