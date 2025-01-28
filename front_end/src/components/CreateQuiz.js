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
  Slider,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Remove as RemoveIcon,
  Quiz as QuizIcon,
  Poll as PollIcon,
  Palette as PaletteIcon,
  Timer as TimerIcon,
  Pattern as PatternIcon,
  Opacity as OpacityIcon
} from '@mui/icons-material';
import { api } from '../services/api';
import { themePresets } from '../theme';

const PATTERNS = ['none', 'circles', 'dots', 'waves', 'grid'];

const CreateQuiz = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('quiz'); // 'quiz' or 'poll'
  const [selectedTheme, setSelectedTheme] = useState('blue');
  const [selectedPattern, setSelectedPattern] = useState('none');
  const [patternOpacity, setPatternOpacity] = useState(30); // 0-100
  const [patternScale, setPatternScale] = useState(50); // 0-100
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
    if (type === 'poll') return; // No correct answers in polls
    const newQuestions = [...questions];
    newQuestions[questionIndex].correctAnswer = optionIndex;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      text: '',
      options: ['', '', '', ''],
      correctAnswer: type === 'poll' ? -1 : 0,
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
      const quiz = await api.createQuiz(title, questions, {
        type,
        theme: selectedTheme,
        pattern: selectedPattern,
        patternOpacity,
        patternScale
      });
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

  const getBackgroundStyles = () => {
    const colors = themePresets[selectedTheme];
    const opacity = patternOpacity / 100;
    const scale = patternScale / 100;
    
    // Convert hex to rgba for pattern color
    const hexToRgba = (hex, alpha) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const patternColor = theme.palette.mode === 'light' 
      ? hexToRgba(colors.primary, opacity)
      : hexToRgba(colors.secondary, opacity);

    const getPatternSize = () => {
      switch (selectedPattern) {
        case 'grid':
          return `${20 + scale * 40}px ${20 + scale * 40}px`;
        case 'dots':
          return `${20 + scale * 30}px ${20 + scale * 30}px`;
        case 'waves':
          return `${40 + scale * 60}px ${40 + scale * 60}px`;
        case 'circles':
          return 'cover';
        default:
          return 'cover';
      }
    };
    
    const customPattern = selectedPattern === 'none' ? 'none' : 
      selectedPattern === 'grid' ? 
        `linear-gradient(${patternColor} 2px, transparent 2px),
         linear-gradient(90deg, ${patternColor} 2px, transparent 2px)` :
      selectedPattern === 'dots' ?
        `radial-gradient(${patternColor} 4px, transparent 4px),
         radial-gradient(${patternColor} 4px, transparent 4px)` :
      selectedPattern === 'waves' ?
        `linear-gradient(45deg, ${patternColor} 25%, transparent 25%),
         linear-gradient(-45deg, ${patternColor} 25%, transparent 25%),
         linear-gradient(45deg, transparent 75%, ${patternColor} 75%),
         linear-gradient(-45deg, transparent 75%, ${patternColor} 75%)` :
      selectedPattern === 'circles' ?
        `radial-gradient(circle at 100% 50%, ${patternColor} 20%, transparent 50%),
         radial-gradient(circle at 0% 50%, ${patternColor} 20%, transparent 50%)` : 'none';

    return {
      background: colors.background,
      backgroundImage: customPattern,
      backgroundSize: getPatternSize(),
      backgroundPosition: 'center',
      transition: 'all 0.3s ease'
    };
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
            onChange={(e, newType) => newType && setType(newType)}
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

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Background Pattern</InputLabel>
            <Select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              startAdornment={<PatternIcon sx={{ mr: 1 }} />}
            >
              {PATTERNS.map((pattern) => (
                <MenuItem key={pattern} value={pattern}>
                  {pattern.charAt(0).toUpperCase() + pattern.slice(1)} Pattern
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {selectedPattern !== 'none' && (
          <Paper sx={{ p: 3, mb: 4 }}>
            <Stack spacing={3}>
              <Box>
                <Typography gutterBottom>Pattern Opacity</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <OpacityIcon />
                  <Slider
                    value={patternOpacity}
                    onChange={(e, value) => setPatternOpacity(value)}
                    min={10}
                    max={50}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Box>
              </Box>
              <Box>
                <Typography gutterBottom>Pattern Size</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PatternIcon />
                  <Slider
                    value={patternScale}
                    onChange={(e, value) => setPatternScale(value)}
                    min={20}
                    max={100}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Box>
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Theme Preview */}
        <Paper 
          sx={{ 
            p: 3,
            mb: 4,
            borderRadius: 2,
            ...getBackgroundStyles(),
            textAlign: 'center'
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>Theme Preview</Typography>
          <Typography variant="body2" color="text.secondary">
            This is how your {type} will look
          </Typography>
        </Paper>

        <form onSubmit={handleSubmit}>
          <Paper 
            sx={{ 
              p: 4,
              mb: 4,
              borderRadius: 2,
              boxShadow: theme.shadows[4],
              ...getBackgroundStyles()
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
                ...getBackgroundStyles(),
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
                {type === 'quiz' && (
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
                    {type === 'quiz' && (
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
                    )}
                  </Box>
                ))}
              </Box>

              {type === 'quiz' && (
                <TextField
                  type="number"
                  label="Timer (seconds)"
                  value={question.timer}
                  onChange={(e) => handleQuestionChange(questionIndex, 'timer', Math.max(5, Math.min(300, parseInt(e.target.value) || 30)))}
                  InputProps={{ inputProps: { min: 5, max: 300 } }}
                  helperText="Time limit: 5-300 seconds"
                  sx={{ mt: 2 }}
                />
              )}
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
  );
};

export default CreateQuiz;
