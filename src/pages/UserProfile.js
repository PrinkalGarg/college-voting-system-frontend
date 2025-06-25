import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Divider,
  Button,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  CardMedia,
  Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PhoneIcon from '@mui/icons-material/Phone';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import axios from 'axios';

const UserProfile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [voteHistory, setVoteHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Debug user data
  console.log('Auth user data in profile:', authUser);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        console.log('User data fetched directly:', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user data');
      }
    };

    if (authUser) {
      fetchUserData();
    }
  }, [authUser]);

  // Redirect if user is admin
  React.useEffect(() => {
    if (authUser?.role === 'admin') {
      navigate('/admin');
    }
  }, [authUser, navigate]);

  // Fetch vote history
  useEffect(() => {
    const fetchVoteHistory = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/votes/user-history');
        setVoteHistory(response.data.voteHistory || []);
      } catch (error) {
        console.error('Error fetching vote history:', error);
        setError('Failed to load vote history');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchVoteHistory();
    }
  }, [user]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/dashboard')}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{ width: 100, height: 100, bgcolor: 'primary.main', mb: 2 }}
          >
            <PersonIcon sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom>
            My Profile
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Student Account
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Full Name
                </Typography>
                <Typography variant="body1">
                  {user.name}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <EmailIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Email Address
                </Typography>
                <Typography variant="body1">
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BadgeIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Registration Number
                </Typography>
                <Typography variant="body1">
                  {user.regNo || 'Not provided'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SchoolIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  School
                </Typography>
                <Typography variant="body1">
                  {user.school || 'Not provided'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarTodayIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Joining Year
                </Typography>
                <Typography variant="body1">
                  {user.joiningYear || 'Not provided'}
                </Typography>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Phone Number
                </Typography>
                <Typography variant="body1">
                  {user.phoneNumber || 'Not provided'}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Account created on {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown date'}
          </Typography>
        </Box>
      </Paper>

      {/* Vote History Section */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <HowToVoteIcon sx={{ mr: 2, color: 'primary.main' }} />
          <Typography variant="h5" component="h2">
            My Vote History
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : voteHistory.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            You haven't voted in any elections yet.
          </Typography>
        ) : (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              You have voted in {voteHistory.length} election{voteHistory.length !== 1 ? 's' : ''}.
            </Typography>
            
            <Grid container spacing={3}>
              {voteHistory.map((vote, index) => (
                <Grid item xs={12} key={index}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" component="div">
                          {vote.electionTitle}
                        </Typography>
                        <Chip 
                          label={formatDate(vote.voteTimestamp)} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {vote.electionDescription}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <Box sx={{ mr: 2 }}>
                          <CardMedia
                            component="img"
                            sx={{ width: 60, height: 60, borderRadius: 1 }}
                            image={vote.candidateImage || 'https://via.placeholder.com/60'}
                            alt={vote.candidateName}
                          />
                        </Box>
                        <Box>
                          <Typography variant="subtitle1">
                            Voted for: {vote.candidateName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {vote.candidateMotto}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button 
                          size="small" 
                          onClick={() => navigate(`/elections/${vote.electionId}/results`)}
                        >
                          View Results
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default UserProfile; 