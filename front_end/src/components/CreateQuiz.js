import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  IconButton,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { api } from '../services/api';

const CreateQuiz = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([
    {
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    }
  ]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [quizId, setQuizId] = useState('');
  const [showCopySnackbar, setShowCopySnackbar] = useState(false);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const quiz = await api.createQuiz(title, questions);
      setQuizId(quiz.id);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  const handleCopyLink = () => {
    const quizLink = `${window.location.origin}/quiz/${quizId}`;
    navigator.clipboard.writeText(quizLink);
    setShowCopySnackbar(true);
  };

  const handleCloseDialog = () => {
    setShowSuccessDialog(false);
    navigate(`/quiz/${quizId}`);
  };

  return (
    <Container maxWidth="md" sx={{ pb: 8 }}>
      <Box 
        sx={{ 
          mt: 6, 
          mb: 6,
          animation: 'fadeIn 0.6s ease-out'
        }}
      >
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{
            background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 4,
            textAlign: 'center'
          }}
        >
          Create Your Quiz
        </Typography>
        <Typography 
          variant="h6" 
          color="text.secondary" 
          sx={{ mb: 6, textAlign: 'center' }}
        >
          Design an engaging quiz with multiple choice questions
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
            required
          />
          {questions.map((question, questionIndex) => (
            <Paper 
              key={questionIndex} 
              sx={{ 
                p: 4, 
                mt: 3,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,51,141,0.08)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(0,51,141,0.12)',
                },
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '4px',
                  height: '100%',
                  background: 'linear-gradient(180deg, #00338D 0%, #00A0DC 100%)',
                }
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={11}>
                  <TextField
                    fullWidth
                    label={`Question ${questionIndex + 1}`}
                    value={question.text}
                    onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                    margin="normal"
                    required
                  />
                </Grid>
                <Grid item xs={1}>
                  <IconButton
                    onClick={() => removeQuestion(questionIndex)}
                    disabled={questions.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
                {question.options.map((option, optionIndex) => (
                  <Grid item xs={12} sm={6} key={optionIndex}>
                    <TextField
                      fullWidth
                      label={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                      required
                    />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <TextField
                    select
                    fullWidth
                    label="Correct Answer"
                    value={question.correctAnswer}
                    onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', Number(e.target.value))}
                    SelectProps={{
                      native: true
                    }}
                    required
                  >
                    {question.options.map((_, index) => (
                      <option key={index} value={index}>
                        Option {index + 1}
                      </option>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </Paper>
          ))}
          <Box sx={{ 
            mt: 4, 
            display: 'flex', 
            gap: 2,
            justifyContent: 'center'
          }}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addQuestion}
              sx={{
                borderWidth: '2px',
                '&:hover': {
                  borderWidth: '2px',
                  background: 'rgba(0,51,141,0.05)',
                }
              }}
            >
              Add Question
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={!title || questions.some(q => !q.text || q.options.some(o => !o))}
              sx={{
                background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
                px: 4,
                '&:hover': {
                  background: 'linear-gradient(90deg, #002266 0%, #007AA6 100%)',
                },
                '&.Mui-disabled': {
                  background: '#e0e0e0',
                }
              }}
            >
              Create Quiz
            </Button>
          </Box>
        </form>

        <Dialog 
          open={showSuccessDialog} 
          onClose={handleCloseDialog}
          PaperProps={{
            sx: {
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,51,141,0.15)',
            }
          }}
        >
          <DialogTitle sx={{ 
            background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
            color: 'white',
            py: 2
          }}>
            Quiz Created Successfully! 🎉
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>
              Your quiz has been created. Share this link with others to let them take the quiz:
            </Typography>
              <Paper
                sx={{
                  p: 2,
                  mt: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(0,51,141,0.05)',
                  border: '1px solid rgba(0,51,141,0.1)',
                  borderRadius: 1
                }}
            >
              <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                {`${window.location.origin}/quiz/${quizId}`}
              </Typography>
              <IconButton onClick={handleCopyLink} size="small">
                <ContentCopyIcon />
              </IconButton>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={handleCloseDialog}
              sx={{
                background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
                color: 'white',
                px: 3,
                '&:hover': {
                  background: 'linear-gradient(90deg, #002266 0%, #007AA6 100%)',
                }
              }}
            >
              View Quiz
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={showCopySnackbar}
          autoHideDuration={3000}
          onClose={() => setShowCopySnackbar(false)}
          message="Quiz link copied to clipboard! 📋"
          sx={{
            '& .MuiSnackbarContent-root': {
              background: 'linear-gradient(90deg, #00338D 0%, #00A0DC 100%)',
              borderRadius: 2
            }
          }}
        />
      </Box>
    </Container>
  );
};

export default CreateQuiz;
