import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  Box,
  Container,
  Typography,
  Paper,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import { Poll as PollIcon } from '@mui/icons-material';

const PollResults = ({ quiz, results }) => {
  const theme = useTheme();

  // Process answer distribution data and count valid responses
  const { answerDistribution, validResponseCount } = useMemo(() => {
    if (!quiz?.questions || !results.length) {
      return { answerDistribution: [], validResponseCount: 0 };
    }

    // Count participants who answered at least one question
    const validResponses = results.filter(result => 
      result.answers.some(answer => answer.selectedOption !== undefined)
    );

    const distribution = quiz.questions.map((question, qIndex) => {
      const optionCounts = question.options.map((option, index) => ({
        option: `Option ${index + 1}`,
        text: option,
        count: 0
      }));

      // Only count responses for this question from participants who answered at least one question
      validResponses.forEach(result => {
        const answer = result.answers.find(a => a.questionId === question.id);
        if (answer !== undefined && answer.selectedOption !== undefined) {
          optionCounts[answer.selectedOption].count++;
        }
      });

      return {
        questionText: question.text,
        options: optionCounts,
        totalResponses: optionCounts.reduce((sum, opt) => sum + opt.count, 0)
      };
    });

    return {
      answerDistribution: distribution,
      validResponseCount: validResponses.length
    };
  }, [quiz, results]);

  const totalParticipants = validResponseCount;

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
            mb: 3
          }}
        >
          Poll Results
        </Typography>
        <Typography 
          variant="h5" 
          color="text.secondary" 
          sx={{ mb: 4, textAlign: 'center' }}
        >
          {quiz.title}
        </Typography>

        <Card sx={{
          background: theme.palette.gradient.background,
          borderRadius: 2,
          boxShadow: theme.shadows[4],
          mb: 4
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography 
              color="primary" 
              gutterBottom
              sx={{ 
                fontSize: '1.1rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <PollIcon /> Total Responses
            </Typography>
            <Typography 
              variant="h3"
              sx={{
                background: theme.palette.gradient.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 600
              }}
            >
              {totalParticipants}
            </Typography>
          </CardContent>
        </Card>

        <Box sx={{ mt: 4, mb: 6 }}>
          {answerDistribution.map((questionData, index) => (
            <Paper
              key={index}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                boxShadow: theme.shadows[4],
                background: theme.palette.gradient.background
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  {questionData.questionText}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {questionData.totalResponses} responses
                </Typography>
              </Box>
              <Box sx={{ height: 300, width: '100%' }}>
                <ResponsiveContainer>
                  <BarChart
                    data={questionData.options}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="option"
                      tick={{ fill: theme.palette.text.primary }}
                    />
                    <YAxis 
                      label={{ 
                        value: 'Number of Responses', 
                        angle: -90, 
                        position: 'insideLeft',
                        fill: theme.palette.text.primary
                      }}
                      tick={{ fill: theme.palette.text.primary }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 1
                      }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <Box sx={{ p: 1.5, background: theme.palette.background.paper }}>
                              <Typography sx={{ mb: 1, fontWeight: 500 }}>
                                {data.text}
                              </Typography>
                              <Typography color="text.secondary">
                                Responses: {data.count}
                              </Typography>
                            </Box>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default PollResults;
