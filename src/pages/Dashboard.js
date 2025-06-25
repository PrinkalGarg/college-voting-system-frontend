import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Paper
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';

const Dashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchElections();
  }, [user, navigate]);

  const fetchElections = async () => {
    try {
      const response = await axios.get('/api/elections/active');
      setElections(response.data);
    } catch (error) {
      console.error('Error fetching elections:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user?.name || 'Student'}!
        </Typography>
        
        {user?.role !== 'admin' && (
          <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body1">
                View your profile information
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/profile')}
            >
              My Profile
            </Button>
          </Paper>
        )}
      </Box>

      <Typography variant="h5" gutterBottom>
        Active Elections
      </Typography>

      {elections.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No active elections at the moment.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {elections.map((election) => (
            <Grid item xs={12} sm={6} md={4} key={election._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {election.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {election.description}
                  </Typography>
                  <Typography variant="body2">
                    Start Date: {formatDate(election.startDate)}
                  </Typography>
                  <Typography variant="body2">
                    End Date: {formatDate(election.endDate)}
                  </Typography>
                  <Typography variant="body2">
                    Candidates: {election.candidates.length}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => navigate(`/elections/${election._id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => navigate(`/elections/${election._id}/results`)}
                  >
                    View Results
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Dashboard; 