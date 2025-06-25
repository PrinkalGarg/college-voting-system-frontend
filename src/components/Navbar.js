import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Tooltip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            College Voting System
          </Typography>
          <Box>
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/admin"
                    sx={{ mx: 1 }}
                  >
                    Admin Dashboard
                  </Button>
                )}
                {user.role !== 'admin' && (
                  <Tooltip title="My Profile">
                    <IconButton
                      color="inherit"
                      component={RouterLink}
                      to="/profile"
                      sx={{ mx: 1 }}
                    >
                      <PersonIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/dashboard"
                  sx={{ mx: 1 }}
                >
                  Dashboard
                </Button>
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  sx={{ mx: 1 }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/login"
                  sx={{ mx: 1 }}
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/register"
                  sx={{ mx: 1 }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 