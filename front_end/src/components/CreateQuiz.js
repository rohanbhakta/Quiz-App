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
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Quiz as QuizIcon,
  Poll as PollIcon,
  Palette as PaletteIcon,
  Timer as TimerIcon
} from '@mui/icons-material';
import { api } from '../services/api';
import { themePresets } from '../theme';

const CreateQuiz = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('quiz'); // 'quiz' or 'poll'
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const [questions, setQuestions] = useState([{
    text: '',
    options: ['', '', '', ''], // Start with 4 options for quiz
    correctAnswer: 0,
    timer: null,
    timerEnabled: false
  }]);

  // Update questions when type changes
  React.useEffect(() => {
    setQuestions(prevQuestions => 
      prevQuestions.map(q => ({
        ...q,
        options: type === 'poll' ? q.options.slice(0, 2) : ['', '', '', ''], // 2 options for poll, 4 for quiz
        correctAnswer: type === 'poll' ? undefined : 0
      }))
    );
  }, [type]);
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

  const addOption = (questionIndex) => {
    if (type !== 'poll') return;
    const newQuestions = [...questions];
    newQuestions[questionIndex].options.push('');
    setQuestions(newQuestions);
  };

  const removeOption = (questionIndex, optionIndex) => {
    if (type !== 'poll') return;
    const newQuestions = [...questions];
    if (newQuestions[questionIndex].options.length > 2) { // Minimum 2 options
      newQuestions[questionIndex].options.splice(optionIndex, 1);
      setQuestions(newQuestions);
    }
  };

  const handleCorrectAnswerChange = (questionIndex, optionIndex) => {
    if (type === 'poll') return; // No correct answers in polls
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = optionIndex;
    setQuestions(newQuestions);
  };

  const handleTimerToggle = (questionIndex) => {
    const newQuestions = [...questions];
    const question = newQuestions[questionIndex];
    question.timerEnabled = !question.timerEnabled;
    question.timer = question.timerEnabled ? 30 : null;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    const newQuestion = {
      text: '',
      options: type === 'poll' ? ['', ''] : ['', '', '', ''], // 2 options for poll, 4 for quiz
      correctAnswer: type === 'poll' ? undefined : 0, // undefined for polls, 0 for quizzes
      timer: null,
      timerEnabled: false
    };
    console.log('Adding new question:', newQuestion); // Debug log
    setQuestions(prevQuestions => [...prevQuestions, newQuestion]);
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
      // Filter out timer if not enabled
      const processedQuestions = questions.map(q => ({
        ...q,
        timer: q.timerEnabled ? q.timer : null
      }));
      const quiz = await api.createQuiz(title, processedQuestions, selectedTheme, type);
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
             (!q.timerEnabled || (q.timer >= 5 && q.timer <= 300))
           );
  };

  const getBackgroundStyles = () => {
    const colors = themePresets[selectedTheme];
    return {
      background: colors.background,
      transition: 'all 0.3s ease'
    };
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      ...getBackgroundStyles()
    }}>
      <Container maxWidth="md">
        <Box sx={{ pt: 6, pb: 8 }}>
          <Typography 
            variant="h2" 
            gutterBottom
            sx={{
              background: theme.palette.gradient.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textAlign: 'center',
              mb: 4
            }}
          >
            Create {type === 'quiz' ? 'Quiz' : 'Poll'}
          </Typography>

          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            mb: 6
          }}>
            <ToggleButtonGroup
              value={type}
              exclusive
              onChange={(e, newType) => {
                if (newType) {
                  setType(newType);
                  // Reset questions with appropriate defaults for the new type
                  setQuestions([{
                    text: '',
                    options: newType === 'poll' ? ['', ''] : ['', '', '', ''],
                    correctAnswer: newType === 'poll' ? undefined : 0,
                    timer: null,
                    timerEnabled: false
                  }]);
                }
              }}
              aria-label="content type"
            >
              <ToggleButton value="quiz" aria-label="quiz">
                <Tooltip title="Create a Quiz">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QuizIcon />
                    <span>Quiz</span>
                  </Box>
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="poll" aria-label="poll">
                <Tooltip title="Create a Poll">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PollIcon />
                    <span>Poll</span>
                  </Box>
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>

            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Theme</InputLabel>
              <Select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value)}
                startAdornment={<PaletteIcon sx={{ mr: 1 }} />}
              >
                {Object.entries(themePresets).map(([name, colors]) => (
                  <MenuItem 
                    key={name} 
                    value={name}
                    sx={{
                      background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 600
                    }}
                  >
                    {name.charAt(0).toUpperCase() + name.slice(1)} Theme
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <form onSubmit={handleSubmit}>
            <Paper 
              sx={{ 
                p: 4,
                mb: 4,
                borderRadius: 2,
                boxShadow: theme.shadows[4],
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }}
            >
              <TextField
                fullWidth
                label={`${type === 'quiz' ? 'Quiz' : 'Poll'} Title`}
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
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  position: 'relative'
                }}
              >
                <Box sx={{ 
                  position: 'absolute', 
                  top: 16, 
                  right: 16,
                  display: 'flex',
                  gap: 1
                }}>
                {question.timerEnabled && (
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: theme.palette.text.secondary,
                      gap: 1
                    }}>
                      <TimerIcon fontSize="small" />
                      <Typography variant="body2">
                        {question.timer}s
                      </Typography>
                    </Box>
                  )}
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
                  {type === 'quiz' ? 'Question' : 'Poll Question'} {questionIndex + 1}
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
                  <Box sx={{ mb: 2 }}>
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
                        {type === 'quiz' ? (
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
                        ) : (
                          <IconButton 
                            onClick={() => removeOption(questionIndex, optionIndex)}
                            disabled={question.options.length <= 2}
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            <RemoveIcon />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                    {type === 'poll' && (
                      <Button
                        startIcon={<AddIcon />}
                        onClick={() => addOption(questionIndex)}
                        variant="outlined"
                        size="small"
                        sx={{ mt: 1 }}
                      >
                        Add Option
                      </Button>
                    )}
                  </Box>
                </Box>

                <Box sx={{ mt: 3 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={question.timerEnabled}
                          onChange={() => handleTimerToggle(questionIndex)}
                          color="primary"
                        />
                      }
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimerIcon fontSize="small" />
                          <span>Timer {question.timerEnabled ? 'Enabled' : 'Disabled'}</span>
                        </Box>
                      }
                    />
                    {question.timerEnabled && (
                      <TextField
                        type="number"
                        label="Timer (seconds)"
                        value={question.timer}
                        onChange={(e) => handleQuestionChange(questionIndex, 'timer', Math.max(5, Math.min(300, parseInt(e.target.value) || 30)))}
                        InputProps={{ inputProps: { min: 5, max: 300 } }}
                        helperText="Time limit: 5-300 seconds"
                        sx={{ mt: 2 }}
                        fullWidth
                      />
                    )}
                </Box>
              </Paper>
            ))}

            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
              {/* Always show Add Question button */}
              <Button
                startIcon={<AddIcon />}
                onClick={addQuestion}
                variant="outlined"
                sx={{ 
                  flex: 1,
                  py: 1.5,
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    backgroundColor: 'rgba(255, 255, 255, 1)'
                  }
                }}
              >
                Add {type === 'poll' ? 'Poll Question' : 'Question'}
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
                    <span>Creating {type === 'quiz' ? 'Quiz' : 'Poll'}...</span>
                  </Box>
                ) : (
                  `Create ${type === 'quiz' ? 'Quiz' : 'Poll'}`
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
    </Box>
  );
};

export default CreateQuiz;
