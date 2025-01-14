import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  IconButton,
  useTheme,
  CircularProgress
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { api } from '../services/api';

const CreateQuiz = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([{
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    timer: 30
  }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = optionIndex;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      text: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      timer: 30
    }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const quiz = await api.createQuiz(title, questions);
      navigate(`/quiz/${quiz.id}/share`);
    } catch (err) {
      setError('Failed to create quiz. Please try again.');
      setLoading(false);
    }
  };

  const isValid = () => {
    return title.trim() !== '' && 
           questions.every(q => 
             q.text.trim() !== '' && 
             q.options.every(opt => opt.trim() !== '') &&
             q.timer >= 5 && q.timer <= 300
           );
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 6, mb: 8 }}>
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
          Create Quiz
        </Typography>

        <form onSubmit={handleSubmit}>
          <Paper 
            sx={{ 
              p: 4,
              mb: 4,
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              background: theme.palette.gradient.background,
            }}
          >
            <TextField
              fullWidth
              label="Quiz Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              variant="outlined"
              required
            />
          </Paper>

          {questions.map((question, questionIndex) => (
            <Paper 
              key={questionIndex}
              sx={{ 
                p: 4,
                mb: 4,
                borderRadius: 2,
                boxShadow: theme.shadows[4],
                background: theme.palette.gradient.background,
                position: 'relative'
              }}
            >
              <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                <IconButton 
                  onClick={() => removeQuestion(questionIndex)}
                  disabled={questions.length === 1}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  <RemoveIcon />
                </IconButton>
              </Box>

              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 3,
                  color: theme.palette.primary.main,
                  fontWeight: 500
                }}
              >
                Question {questionIndex + 1}
              </Typography>

              <TextField
                fullWidth
                label="Question Text"
                value={question.text}
                onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                margin="normal"
                variant="outlined"
                required
              />

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>Options:</Typography>
                {question.options.map((option, optionIndex) => (
                  <Box 
                    key={optionIndex} 
                    sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2
                    }}
                  >
                    <TextField
                      fullWidth
                      label={`Option ${optionIndex + 1}`}
                      value={option}
                      onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                      required
                    />
                    <Button
                      variant={question.correctAnswer === optionIndex ? "contained" : "outlined"}
                      onClick={() => handleCorrectAnswerChange(questionIndex, optionIndex)}
                      sx={{
                        minWidth: 120,
                        background: question.correctAnswer === optionIndex 
                          ? theme.palette.gradient.primary 
                          : 'transparent',
                        '&:hover': {
                          background: question.correctAnswer === optionIndex 
                            ? theme.palette.gradient.hover 
                            : theme.palette.action.hover
                        }
                      }}
                    >
                      {question.correctAnswer === optionIndex ? "Correct ✓" : "Mark Correct"}
                    </Button>
                  </Box>
                ))}
              </Box>

              <TextField
                type="number"
                label="Timer (seconds)"
                value={question.timer}
                onChange={(e) => handleQuestionChange(questionIndex, 'timer', Math.max(5, Math.min(300, parseInt(e.target.value) || 30)))}
                InputProps={{ inputProps: { min: 5, max: 300 } }}
                helperText="Time limit: 5-300 seconds"
                sx={{ mt: 2 }}
              />
            </Paper>
          ))}

          <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
            <Button
              startIcon={<AddIcon />}
              onClick={addQuestion}
              variant="outlined"
              sx={{ 
                flex: 1,
                py: 1.5,
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.dark,
                  backgroundColor: theme.palette.action.hover
                }
              }}
            >
              Add Question
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={!isValid() || loading}
              sx={{ 
                flex: 2,
                py: 1.5,
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
                  <span>Creating Quiz...</span>
                </Box>
              ) : (
                'Create Quiz'
              )}
            </Button>
          </Box>

          {error && (
            <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>
              {error}
            </Typography>
          )}
        </form>
      </Box>
    </Container>
  );
};

export default CreateQuiz;
