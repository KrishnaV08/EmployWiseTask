import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Card,
  CardContent,
  CardMedia,
  Button,
  Pagination,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  IconButton,
  Box,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const USERS_PER_PAGE = 4;

const UsersPage = () => {
  const [allUsers, setAllUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'success' });
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      navigate('/', { replace: true });
    } else {
      setLoading(true);
      fetchAllUsers();
    }

    setAuthChecked(true);
  }, [navigate]);

  const fetchAllUsers = async () => {
    try {
      const [res1, res2] = await Promise.all([
        axios.get('https://reqres.in/api/users?page=1'),
        axios.get('https://reqres.in/api/users?page=2'),
      ]);
      setAllUsers([...res1.data.data, ...res2.data.data]);
    } catch (err) {
      console.error('Failed to fetch users', err);
      setSnack({ open: true, message: 'Failed to load users.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      navigate('/');
    }
  };

  const handleEditClick = (user) => {
    setEditUser({ ...user });
    setOpenDialog(true);
  };

  const handleEditSubmit = async () => {
    try {
      await axios.put(`https://reqres.in/api/users/${editUser.id}`, editUser);
      setAllUsers((prev) =>
        prev.map((user) => (user.id === editUser.id ? { ...user, ...editUser } : user))
      );
      setSnack({ open: true, message: 'User updated successfully!', severity: 'success' });
      setOpenDialog(false);
    } catch {
      setSnack({ open: true, message: 'Failed to update user.', severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`https://reqres.in/api/users/${id}`);
        setAllUsers((prev) => prev.filter((user) => user.id !== id));
        setSnack({ open: true, message: 'User deleted successfully!', severity: 'success' });
      } catch {
        setSnack({ open: true, message: 'Failed to delete user.', severity: 'error' });
      }
    }
  };

  const filteredUsers = allUsers.filter((user) =>
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const currentUsers = filteredUsers.slice(
    (page - 1) * USERS_PER_PAGE,
    page * USERS_PER_PAGE
  );

  if (!authChecked || loading) {
    return (
      <Box height="100vh" display="flex" alignItems="center" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6">User Management</Typography>
          <Button color="inherit" onClick={handleLogout}>Logout</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Box mb={3}>
          <TextField
            label="Search by name or email"
            variant="outlined"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Box>

        <Grid container spacing={3} justifyContent="center">
          {currentUsers.map((user) => (
            <Grid item key={user.id}>
              <Card sx={{ width: 200, textAlign: 'center', p: 1 }}>
                <CardMedia
                  component="img"
                  image={user.avatar}
                  alt={user.first_name}
                  sx={{ width: 100, height: 100, mx: 'auto', borderRadius: '50%' }}
                />
                <CardContent>
                  <Typography variant="subtitle1">
                    {user.first_name} {user.last_name}
                  </Typography>
                  <Typography variant="body2">{user.email}</Typography>
                  <Box mt={2} display="flex" justifyContent="center" gap={1}>
                    <IconButton onClick={() => handleEditClick(user)} color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(user.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Grid>
      </Container>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="First Name"
            fullWidth
            value={editUser?.first_name || ''}
            onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Last Name"
            fullWidth
            value={editUser?.last_name || ''}
            onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={editUser?.email || ''}
            onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleEditSubmit}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ width: '100%' }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UsersPage;
