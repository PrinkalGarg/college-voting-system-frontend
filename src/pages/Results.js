import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardMedia,
  LinearProgress
} from '@mui/material';
import axios from 'axios';

const Results = () => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { electionId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, [electionId]);

  const fetchResults = async () => {
    try {
      const response = await axios.get(`/api/votes/results/${electionId}`);
      setResults(response.data.election);
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching results');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '80vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!results) {
    return (
      <Container>
        <Alert severity="info">No results available yet.</Alert>
      </Container>
    );
  }

  const maxVotes = Math.max(...results.candidates.map(c => c.voteCount));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Election Results
        </Typography>

        <Typography variant="h5" gutterBottom>
          {results.title}
        </Typography>

        <Typography variant="body1" color="text.secondary" paragraph>
          {results.description}
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Total Votes: {results.totalVotes}
        </Typography>

        <Box sx={{ mt: 4 }}>
          {results.candidates.map((candidate, index) => {
            const percentage = results.totalVotes > 0
              ? (candidate.voteCount / results.totalVotes) * 100
              : 0;

            return (
              <Card key={candidate._id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                  <CardMedia
                    component="img"
                    sx={{ width: { xs: '100%', md: 200 }, height: { xs: 200, md: 'auto' } }}
                    image={candidate.image}
                    alt={candidate.name}
                  />
                  <CardContent sx={{ flex: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {index + 1}. {candidate.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {candidate.motto}
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2">
                          Votes: {candidate.voteCount}
                        </Typography>
                        <Typography variant="body2">
                          {percentage.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(candidate.voteCount / maxVotes) * 100}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                  </CardContent>
                </Box>
              </Card>
            );
          })}
        </Box>
      </Paper>
    </Container>
  );
};

export default Results; 