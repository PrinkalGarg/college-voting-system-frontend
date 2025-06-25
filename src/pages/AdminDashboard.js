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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import axios from 'axios';

const AdminDashboard = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = async () => {
    try {
      const response = await axios.get('/api/elections');
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

  const getElectionStatus = (election) => {
    const now = new Date();
    const startDate = new Date(election.startDate);
    const endDate = new Date(election.endDate);

    if (now < startDate) {
      return { label: 'Upcoming', color: 'info' };
    } else if (now > endDate) {
      return { label: 'Completed', color: 'success' };
    } else {
      return { label: 'Active', color: 'primary' };
    }
  };

  const handleDelete = async (electionId) => {
    try {
      await axios.delete(`/api/elections/${electionId}`);
      fetchElections();
    } catch (error) {
      console.error('Error deleting election:', error);
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Election Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/admin/create-election')}
        >
          Create New Election
        </Button>
      </Box>

      <Typography variant="h5" gutterBottom>
        All Elections
      </Typography>

      {elections.length === 0 ? (
        <Typography variant="body1" color="text.secondary">
          No elections created yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {elections.map((election) => {
            const status = getElectionStatus(election);
            return (
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
                      Start: {formatDate(election.startDate)}
                    </Typography>
                    <Typography variant="body2">
                      End: {formatDate(election.endDate)}
                    </Typography>
                    <Chip
                      label={status.label}
                      color={status.color}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/elections/${election._id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="small"
                      color="secondary"
                      onClick={() => navigate(`/admin/elections/${election._id}/candidates/create`)}
                    >
                      Add Candidate
                    </Button>
                    <Button
                      size="small"
                      color="info"
                      onClick={() => navigate(`/elections/${election._id}/results`)}
                    >
                      View Stats
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedElection(election);
                        setOpenDeleteDialog(true);
                      }}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Election</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the election "{selectedElection?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              handleDelete(selectedElection?._id);
              setOpenDeleteDialog(false);
            }}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard; 