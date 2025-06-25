import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
  TextField
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

const ElectionDetails = () => {
  const [election, setElection] = useState(null);
  const [voteHistory, setVoteHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    startDate: null,
    endDate: null
  });
  const { electionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchElectionDetails = useCallback(async () => {
    if (!electionId) {
      setError('Invalid election ID');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`/api/elections/${electionId}`);
      
      if (response.data) {
        // Calculate vote percentages for each candidate
        const totalVotes = response.data.totalVotes || 0;
        const candidatesWithPercentages = response.data.candidates.map(candidate => ({
          ...candidate,
          percentage: totalVotes > 0 ? ((candidate.voteCount || 0) / totalVotes * 100).toFixed(1) : 0
        }));
        
        setElection({
          ...response.data,
          candidates: candidatesWithPercentages
        });
      } else {
        setError('No election data received');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error fetching election details');
    } finally {
      setLoading(false);
    }
  }, [electionId]);

  const fetchVoteHistory = useCallback(async () => {
    if (!electionId || user?.role !== 'admin') {
      return;
    }

    try {
      const response = await axios.get(`/api/votes/history/${electionId}`);
      if (response.data) {
        setVoteHistory(response.data.voteHistory || []);
        if (response.data.election) {
          setElection(prev => ({
            ...prev,
            ...response.data.election
          }));
        }
      }
    } catch (error) {
      // Don't set error state here as it's not critical
    }
  }, [electionId, user?.role]);

  useEffect(() => {
    if (!electionId) {
      setError('Invalid election ID');
      setLoading(false);
      return;
    }
    
    fetchElectionDetails();
    if (user?.role === 'admin') {
      fetchVoteHistory();
    }
  }, [electionId, user?.role, fetchElectionDetails, fetchVoteHistory]);

  const handleVote = async (candidateId) => {
    if (!electionId || !candidateId) {
      setError('Invalid election or candidate ID');
      return;
    }

    try {
      await axios.post('/api/votes', {
        electionId: electionId,
        candidateId
      });
      setOpenDialog(false);
      // Refresh election details after voting
      fetchElectionDetails();
    } catch (error) {
      setError(error.response?.data?.message || 'Error casting vote');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEditClick = () => {
    setEditFormData({
      title: election.title,
      description: election.description,
      startDate: new Date(election.startDate),
      endDate: new Date(election.endDate)
    });
    setOpenEditDialog(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditDateChange = (name) => (date) => {
    setEditFormData(prev => ({
      ...prev,
      [name]: date
    }));
  };

  const handleEditSubmit = async () => {
    try {
      if (!editFormData.startDate || !editFormData.endDate) {
        throw new Error('Please select both start and end dates');
      }

      if (editFormData.startDate >= editFormData.endDate) {
        throw new Error('End date must be after start date');
      }

      await axios.put(`/api/elections/${electionId}`, {
        ...editFormData,
        startDate: editFormData.startDate.toISOString(),
        endDate: editFormData.endDate.toISOString()
      });

      setOpenEditDialog(false);
      fetchElectionDetails();
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/elections/${electionId}`);
      navigate('/admin');
    } catch (error) {
      setError(error.response?.data?.message || 'Error deleting election');
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

  if (!election) {
    return (
      <Container>
        <Alert severity="error">Election not found</Alert>
      </Container>
    );
  }

  const hasVoted = user?.hasVoted?.includes(electionId) || false;
  const isActive = new Date() >= new Date(election.startDate) && 
                  new Date() <= new Date(election.endDate);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {election.title}
        </Typography>
        {user?.role === 'admin' && (
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleEditClick}
              sx={{ mr: 2 }}
            >
              Edit Election
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => setOpenDeleteDialog(true)}
            >
              Delete Election
            </Button>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!isActive ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          This election is not currently active.
        </Alert>
      ) : hasVoted ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          You have already voted in this election.
        </Alert>
      ) : (
        <Typography variant="h6" gutterBottom>
          Select a candidate to vote:
        </Typography>
      )}

      {user?.role === 'admin' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Election Statistics
          </Typography>
          <Grid container spacing={3}>
            {election.candidates?.map((candidate) => (
              <Grid item xs={12} key={candidate._id || candidate.name}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body1">
                      {candidate.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {candidate.voteCount} votes ({candidate.percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={parseFloat(candidate.percentage)} 
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      <Grid container spacing={3}>
        {election.candidates?.map((candidate) => {
          return (
            <Grid item xs={12} sm={6} md={4} key={candidate._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="300"
                  image={candidate.image || 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20300%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18a5c5c5c5c%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3A-apple-system%2CBlinkMacSystemFont%2C%26quot%3BSegoe%20UI%26quot%3B%2CRoboto%2C%26quot%3BHelvetica%20Neue%26quot%3B%2CArial%2C%26quot%3BNoto%20Sans%26quot%3B%2Csans-serif%2C%26quot%3BApple%20Color%20Emoji%26quot%3B%2C%26quot%3BSegoe%20UI%20Emoji%26quot%3B%2C%26quot%3BSegoe%20UI%20Symbol%26quot%3B%2C%26quot%3BNoto%20Color%20Emoji%26quot%3B%2Cmonospace%2C%26quot%3BSegoe%20UI%20Mono%26quot%3B%2C%26quot%3BRoboto%20Mono%26quot%3B%2C%26quot%3BMonaco%26quot%3B%2C%26quot%3BCourier%20New%26quot%3B%2Cmonospace%3Bfont-size%3A15em%20%7D%20%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18a5c5c5c5c%22%3E%3Crect%20width%3D%22300%22%20height%3D%22300%22%20fill%3D%22%23373940%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22106.5%22%20y%3D%22160.5%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'}
                  alt={candidate.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22300%22%20height%3D%22300%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20300%20300%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18a5c5c5c5c%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3A-apple-system%2CBlinkMacSystemFont%2C%26quot%3BSegoe%20UI%26quot%3B%2CRoboto%2C%26quot%3BHelvetica%20Neue%26quot%3B%2CArial%2C%26quot%3BNoto%20Sans%26quot%3B%2Csans-serif%2C%26quot%3BApple%20Color%20Emoji%26quot%3B%2C%26quot%3BSegoe%20UI%20Emoji%26quot%3B%2C%26quot%3BSegoe%20UI%20Symbol%26quot%3B%2C%26quot%3BNoto%20Color%20Emoji%26quot%3B%2Cmonospace%2C%26quot%3BSegoe%20UI%20Mono%26quot%3B%2C%26quot%3BRoboto%20Mono%26quot%3B%2C%26quot%3BMonaco%26quot%3B%2C%26quot%3BCourier%20New%26quot%3B%2Cmonospace%3Bfont-size%3A15em%20%7D%20%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18a5c5c5c5c%22%3E%3Crect%20width%3D%22300%22%20height%3D%22300%22%20fill%3D%22%23373940%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%22106.5%22%20y%3D%22160.5%22%3ENo%20Image%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E';
                  }}
                  sx={{
                    objectFit: 'contain',
                    backgroundColor: '#f5f5f5',
                    padding: 1,
                    minHeight: '300px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {candidate.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {candidate.motto}
                  </Typography>
                </CardContent>
                {isActive && !hasVoted && user?.role !== 'admin' && (
                  <Box sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => {
                        setSelectedCandidate(candidate);
                        setOpenDialog(true);
                      }}
                    >
                      Vote for {candidate.name}
                    </Button>
                  </Box>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {user?.role === 'admin' && voteHistory.length > 0 && (
        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Vote History
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Voter Name</TableCell>
                  <TableCell>Registration Number</TableCell>
                  <TableCell>Voted For</TableCell>
                  <TableCell>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {voteHistory.map((vote, index) => (
                  <TableRow key={index}>
                    <TableCell>{vote.voterName}</TableCell>
                    <TableCell>{vote.voterRegNo}</TableCell>
                    <TableCell>{vote.candidateName}</TableCell>
                    <TableCell>{formatDate(vote.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Your Vote</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to vote for {selectedCandidate?.name}?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={() => handleVote(selectedCandidate._id)}
            color="primary"
          >
            Confirm Vote
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Election Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Election</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="edit-title"
              label="Election Title"
              name="title"
              value={editFormData.title}
              onChange={handleEditChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="edit-description"
              label="Description"
              name="description"
              multiline
              rows={4}
              value={editFormData.description}
              onChange={handleEditChange}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ mt: 2 }}>
                <DateTimePicker
                  label="Start Date & Time"
                  value={editFormData.startDate}
                  onChange={handleEditDateChange('startDate')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <DateTimePicker
                  label="End Date & Time"
                  value={editFormData.endDate}
                  onChange={handleEditDateChange('endDate')}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Box>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Election</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this election? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ElectionDetails; 